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
    const { lat, lng, city, contactType = 'police' } = await req.json();
    console.log('Getting emergency services for:', { lat, lng, city, contactType });

    let emergencyServices = [];

    // If Google Maps API key is available, use Places API
    if (googleMapsApiKey && lat && lng) {
      try {
        const placeType = getPlaceType(contactType);
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${placeType}&key=${googleMapsApiKey}`
        );
        
        if (placesResponse.ok) {
          const placesData = await placesResponse.json();
          console.log('Places API response:', placesData);
          
          if (placesData.results && placesData.results.length > 0) {
            emergencyServices = await Promise.all(
              placesData.results.slice(0, 5).map(async (place: any) => {
                // Get place details for phone number
                const detailsResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,international_phone_number&key=${googleMapsApiKey}`
                );
                
                let phoneNumber = getDefaultPhone(contactType);
                if (detailsResponse.ok) {
                  const detailsData = await detailsResponse.json();
                  phoneNumber = detailsData.result?.formatted_phone_number || 
                               detailsData.result?.international_phone_number || 
                               phoneNumber;
                }
                
                // Calculate distance
                const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
                
                return {
                  name: place.name,
                  phone_number: phoneNumber,
                  contact_type: contactType,
                  address: place.vicinity || place.formatted_address,
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                  distance_km: Math.round(distance * 100) / 100,
                  rating: place.rating || 0
                };
              })
            );
          }
        }
      } catch (error) {
        console.error('Error calling Google Places API:', error);
      }
    }

    // If no live data or as fallback, get from database
    if (emergencyServices.length === 0) {
      console.log('Using database emergency contacts');
      const { data: contacts, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('city', city || 'Mumbai')
        .eq('contact_type', contactType)
        .eq('is_active', true)
        .order('distance_km', { ascending: true })
        .limit(5);
      
      if (error) {
        console.error('Database error:', error);
      } else if (contacts && contacts.length > 0) {
        emergencyServices = contacts.map(contact => ({
          name: contact.name,
          phone_number: contact.phone_number,
          contact_type: contact.contact_type,
          address: contact.address,
          lat: contact.lat,
          lng: contact.lng,
          distance_km: contact.distance_km || 1.5
        }));
      }
    }

    // Final fallback to hardcoded emergency numbers
    if (emergencyServices.length === 0) {
      emergencyServices = getDefaultEmergencyServices(contactType, city);
    }

    return new Response(JSON.stringify({ 
      services: emergencyServices,
      total: emergencyServices.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-emergency-services function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getPlaceType(contactType: string): string {
  const placeTypeMap: { [key: string]: string } = {
    'police': 'police',
    'hospital': 'hospital',
    'fire': 'fire_station',
    'helpline': 'local_government_office'
  };
  
  return placeTypeMap[contactType] || 'police';
}

function getDefaultPhone(contactType: string): string {
  const phoneMap: { [key: string]: string } = {
    'police': '+91-100',
    'hospital': '+91-108',
    'fire': '+91-101',
    'helpline': '+91-1091'
  };
  
  return phoneMap[contactType] || '+91-100';
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getDefaultEmergencyServices(contactType: string, city: string) {
  const defaultServices = {
    police: [
      { name: "Police Control Room", phone_number: "+91-100", distance_km: 1.0 },
      { name: `${city} Police Station`, phone_number: "+91-100", distance_km: 1.5 }
    ],
    hospital: [
      { name: "Emergency Medical Services", phone_number: "+91-108", distance_km: 1.2 },
      { name: `${city} General Hospital`, phone_number: "+91-108", distance_km: 2.0 }
    ],
    fire: [
      { name: "Fire Department", phone_number: "+91-101", distance_km: 1.8 }
    ],
    helpline: [
      { name: "Women Helpline", phone_number: "+91-1091", distance_km: 0.5 },
      { name: "Child Helpline", phone_number: "+91-1098", distance_km: 0.5 }
    ]
  };
  
  const services = defaultServices[contactType as keyof typeof defaultServices] || defaultServices.police;
  
  return services.map(service => ({
    ...service,
    contact_type: contactType,
    address: `${city}, India`,
    lat: null,
    lng: null
  }));
}