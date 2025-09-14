import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, time, city, userId } = await req.json();
    console.log('Analyzing route:', { origin, destination, time, city });

    let routeData = null;
    let riskScore = 50;
    let shortReason = "Route analysis completed";
    let detailedReason = ["Analysis based on available data"];
    let recommendedRoute = "Current route appears safe";
    let nearestHelp = [];

    // If Google Maps API key is available, use live data
    if (googleMapsApiKey) {
      try {
        // Get route information from Google Maps
        const directionsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${googleMapsApiKey}`
        );
        
        if (directionsResponse.ok) {
          const directionsData = await directionsResponse.json();
          
          if (directionsData.routes && directionsData.routes.length > 0) {
            const route = directionsData.routes[0];
            const leg = route.legs[0];
            
            // Get places along the route for safety analysis
            const waypoints = route.overview_polyline?.points;
            
            // Analyze risk factors based on route characteristics
            const duration = leg.duration?.value || 0;
            const distance = leg.distance?.value || 0;
            const isNightTime = time && new Date(time).getHours() >= 22 || new Date(time).getHours() <= 6;
            
            // Use Gemini AI for enhanced route analysis if available
            if (geminiApiKey) {
              const geminiAnalysis = await analyzeRouteWithGemini(origin, destination, time, city, route, leg);
              if (geminiAnalysis) {
                riskScore = geminiAnalysis.riskScore;
                shortReason = geminiAnalysis.shortReason;
                detailedReason = geminiAnalysis.detailedReason;
                recommendedRoute = geminiAnalysis.recommendedRoute;
              }
            } else {
              // Fallback to original calculation
              riskScore = calculateRiskScore(duration, distance, isNightTime, route.summary);
              shortReason = generateShortReason(riskScore, isNightTime, route.summary);
              detailedReason = generateDetailedReason(duration, distance, isNightTime, route.summary);
              recommendedRoute = generateRecommendedRoute(riskScore, route.summary);
            }
            
            // Get nearby emergency services
            nearestHelp = await getNearbyEmergencyServices(leg.start_location, city);
            
            routeData = {
              duration: leg.duration?.text,
              distance: leg.distance?.text,
              summary: route.summary,
              start_location: leg.start_location,
              end_location: leg.end_location
            };
          }
        }
      } catch (error) {
        console.error('Error calling Google Maps API:', error);
      }
    }

    // If no live data available, use mock data based on origin/destination
    if (!routeData) {
      console.log('Using mock data for route analysis');
      const mockScenario = getMockScenario(origin, destination, time);
      riskScore = mockScenario.risk_score;
      shortReason = mockScenario.short_reason;
      detailedReason = mockScenario.detailed_reason;
      recommendedRoute = mockScenario.recommended_route;
      nearestHelp = mockScenario.nearest_help;
    }

    // Save route analysis to database if user is provided
    if (userId) {
      try {
        const { error } = await supabase
          .from('route_analyses')
          .insert({
            user_id: userId,
            origin_address: origin,
            destination_address: destination,
            travel_time: time ? new Date(time).toISOString() : new Date().toISOString(),
            risk_score: riskScore,
            short_reason: shortReason,
            detailed_reason: detailedReason,
            recommended_route: recommendedRoute,
            analysis_data: routeData
          });
        
        if (error) {
          console.error('Error saving route analysis:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    const response = {
      risk_score: riskScore,
      short_reason: shortReason,
      detailed_reason: detailedReason,
      recommended_route: recommendedRoute,
      nearest_help: nearestHelp,
      chat_lines: [
        `EN: ${shortReason}`,
        `HI: ${translateToHindi(shortReason)}`
      ],
      route_data: routeData
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-route function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateRiskScore(duration: number, distance: number, isNightTime: boolean, routeSummary: string): number {
  let score = 30; // Base score
  
  // Night time increases risk
  if (isNightTime) score += 25;
  
  // Long duration increases risk slightly
  if (duration > 3600) score += 10; // More than 1 hour
  
  // Check for highways vs local roads
  if (routeSummary.toLowerCase().includes('highway') || routeSummary.toLowerCase().includes('expressway')) {
    score -= 10; // Highways are generally safer
  }
  
  // Random factor for incidents/reports simulation
  score += Math.floor(Math.random() * 20);
  
  return Math.min(100, Math.max(0, score));
}

function generateShortReason(riskScore: number, isNightTime: boolean, routeSummary: string): string {
  if (riskScore > 66) {
    return isNightTime 
      ? `High risk due to late hour and limited visibility on ${routeSummary}`
      : `Elevated risk detected along ${routeSummary} route`;
  } else if (riskScore > 33) {
    return `Moderate safety concerns on ${routeSummary} - exercise caution`;
  } else {
    return `Safe route via ${routeSummary} with good visibility`;
  }
}

function generateDetailedReason(duration: number, distance: number, isNightTime: boolean, routeSummary: string): string[] {
  const reasons = [];
  
  if (isNightTime) {
    reasons.push("Travel during night hours with reduced visibility");
  }
  
  if (duration > 3600) {
    reasons.push("Extended travel time increases exposure to potential risks");
  }
  
  reasons.push(`Route via ${routeSummary} - ${Math.floor(distance/1000)}km distance`);
  
  // Add simulated safety factors
  const safetyFactors = [
    "Well-lit main roads with regular traffic",
    "CCTV coverage available on major intersections",
    "Police patrol routes include this area",
    "Limited street lighting in some sections",
    "Isolated stretches with minimal foot traffic"
  ];
  
  reasons.push(safetyFactors[Math.floor(Math.random() * safetyFactors.length)]);
  
  return reasons;
}

function generateRecommendedRoute(riskScore: number, routeSummary: string): string {
  if (riskScore > 66) {
    return "Consider alternative main road routes with better lighting and higher traffic volume";
  } else if (riskScore > 33) {
    return "Current route is acceptable - stay alert and consider traveling in groups if possible";
  } else {
    return `Current route via ${routeSummary} is recommended - good safety profile`;
  }
}

async function getNearbyEmergencyServices(location: any, city: string) {
  try {
    // Try to get from database first
    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('city', city)
      .eq('is_active', true)
      .limit(3);
    
    if (contacts && contacts.length > 0) {
      return contacts.map(contact => ({
        name: contact.name,
        distance_km: contact.distance_km || 1.5,
        phone: contact.phone_number
      }));
    }
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
  }
  
  // Fallback to default contacts
  return [
    { name: "Local Police Station", distance_km: 1.2, phone: "+91-100" },
    { name: "Emergency Services", distance_km: 0.8, phone: "+91-108" },
    { name: "Women Helpline", distance_km: 1.5, phone: "+91-1091" }
  ];
}

function getMockScenario(origin: string, destination: string, time: string) {
  // Check if it's a night scenario
  const isNight = time && (new Date(time).getHours() >= 22 || new Date(time).getHours() <= 6);
  
  if (isNight || origin.toLowerCase().includes('college') || destination.toLowerCase().includes('university')) {
    return {
      risk_score: 78,
      short_reason: "Dim street lights and low pedestrian traffic at night.",
      detailed_reason: [
        "Limited street lighting between university and station",
        "Low foot traffic after 10 PM on this route",
        "2 safety incidents reported in past 6 months"
      ],
      recommended_route: "Take the main road via Western Express Highway — better lit with regular police patrolling.",
      nearest_help: [
        {"name":"Bandra Police Station","distance_km":1.2,"phone":"+91-22-26422222"}
      ]
    };
  }
  
  // Check for office/business district routes
  if (origin.toLowerCase().includes('office') || destination.toLowerCase().includes('office') || 
      origin.toLowerCase().includes('lower parel') || destination.toLowerCase().includes('bkc')) {
    return {
      risk_score: 25,
      short_reason: "Safe business district route with good security coverage.",
      detailed_reason: [
        "Well-lit commercial area with regular security patrols",
        "High foot traffic during business hours",
        "Multiple CCTV cameras and emergency call points"
      ],
      recommended_route: "Current route through business district is optimal and safe.",
      nearest_help: [
        {"name":"BKC Police Station","distance_km":0.5,"phone":"+91-22-26572000"}
      ]
    };
  }
  
  return {
    risk_score: 45,
    short_reason: "Standard city route with moderate traffic and good visibility.",
    detailed_reason: [
      "Regular daytime traffic provides natural surveillance",
      "Well-maintained main roads with adequate lighting",
      "Multiple alternative routes available if needed"
    ],
    recommended_route: "Stick to main roads and avoid narrow lanes. Current route is suitable for travel.",
    nearest_help: [
      {"name":"Local Police Station","distance_km":0.8,"phone":"+91-100"}
    ]
  };
}

function translateToHindi(text: string): string {
  const translations: { [key: string]: string } = {
    "Dim street lights and low foot traffic at night": "रात में कम रोशनी और कम पैदल यातायात",
    "Moderate traffic with good visibility": "अच्छी दृश्यता के साथ मध्यम ट्रैफिक",
    "High risk due to late hour": "देर रात के कारण उच्च जोखिम",
    "Safe route with good visibility": "अच्छी दृश्यता के साथ सुरक्षित रास्ता"
  };
  
  // Simple translation fallback
  for (const [en, hi] of Object.entries(translations)) {
    if (text.includes(en)) {
      return text.replace(en, hi);
    }
  }
  
  return "मार्ग विश्लेषण पूर्ण - सावधानी बरतें"; // Default: Route analysis complete - exercise caution
}

async function analyzeRouteWithGemini(origin: string, destination: string, time: string, city: string, route: any, leg: any) {
  try {
    // Get recent incidents and risk factors for the area
    const { data: incidents } = await supabase
      .from('safety_incidents')
      .select('*')
      .eq('verified', true)
      .limit(10);
    
    const { data: riskFactors } = await supabase
      .from('risk_factors')
      .select('*')
      .limit(10);

    const incidentContext = incidents?.map(i => 
      `${i.incident_type} at ${i.location_name} (severity: ${i.severity}/10)`
    ).join(', ') || 'No recent incidents available';

    const riskContext = riskFactors?.map(r => 
      `${r.factor_type} at ${r.location_name} (risk: ${r.risk_level}/10)`
    ).join(', ') || 'No specific risk factors identified';

    const duration = leg.duration?.value || 0;
    const distance = leg.distance?.value || 0;
    const travelTime = new Date(time);
    const isNightTime = travelTime.getHours() >= 22 || travelTime.getHours() <= 6;

    const prompt = `Analyze the safety of this route for women's travel:

Route Details:
- From: ${origin}
- To: ${destination}  
- Travel time: ${time}
- City: ${city}
- Route summary: ${route.summary}
- Duration: ${Math.floor(duration/60)} minutes
- Distance: ${Math.floor(distance/1000)} km
- Night travel: ${isNightTime ? 'Yes' : 'No'}

Safety Context:
- Recent incidents in area: ${incidentContext}
- Risk factors: ${riskContext}

Please provide:
1. Risk Score (0-100, where 0 is safest)
2. Short reason (1-2 sentences)
3. Detailed reasons (3-4 bullet points)
4. Recommended route suggestions

Focus on factors like: lighting, foot traffic, crime history, time of day, area reputation, emergency service proximity.

Format response as JSON:
{
  "riskScore": number,
  "shortReason": "string", 
  "detailedReason": ["reason1", "reason2", "reason3"],
  "recommendedRoute": "string"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!geminiText) {
      console.error('No response from Gemini API');
      return null;
    }

    // Try to extract JSON from response
    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from Gemini response');
      return null;
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('Gemini route analysis:', analysis);
    
    return {
      riskScore: Math.min(100, Math.max(0, analysis.riskScore || 50)),
      shortReason: analysis.shortReason || 'Route analysis completed',
      detailedReason: Array.isArray(analysis.detailedReason) ? analysis.detailedReason : ['Analysis completed with available data'],
      recommendedRoute: analysis.recommendedRoute || 'Current route appears suitable'
    };

  } catch (error) {
    console.error('Error in Gemini route analysis:', error);
    return null;
  }
}