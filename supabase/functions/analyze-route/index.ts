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
            
            // Calculate risk score based on various factors
            riskScore = calculateRiskScore(duration, distance, isNightTime, route.summary);
            
            shortReason = generateShortReason(riskScore, isNightTime, route.summary);
            detailedReason = generateDetailedReason(duration, distance, isNightTime, route.summary);
            recommendedRoute = generateRecommendedRoute(riskScore, route.summary);
            
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
  
  if (isNight || origin.toLowerCase().includes('college') || destination.toLowerCase().includes('home')) {
    return {
      risk_score: 78,
      short_reason: "Dim street lights and low foot traffic at night near Link Road.",
      detailed_reason: [
        "3 incidents reported in past 12 months within 500m",
        "Low streetlight density, CCTV coverage minimal",
        "Isolated stretch with low pedestrian traffic after 10 PM"
      ],
      recommended_route: "Take Main Road (Route B) — slightly longer but better lit and passes by police chowki.",
      nearest_help: [
        {"name":"Bandra Police Station","distance_km":1.2,"phone":"+91-22-26422222"}
      ]
    };
  }
  
  return {
    risk_score: 45,
    short_reason: "Moderate traffic with good visibility during daytime hours.",
    detailed_reason: [
      "Regular daytime traffic provides natural surveillance",
      "Well-maintained roads with adequate lighting",
      "Multiple alternative routes available"
    ],
    recommended_route: "Current route is suitable for daytime travel. Consider main roads for evening travel.",
    nearest_help: [
      {"name":"Local Police Chowki","distance_km":0.8,"phone":"+91-100"}
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