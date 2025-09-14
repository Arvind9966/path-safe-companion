import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || Deno.env.get('MAPBOX_PUBLIC_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Google Maps API key...');
    
    if (!googleMapsApiKey) {
      console.log('Google Maps API key not configured in environment');
      return new Response(JSON.stringify({ 
        error: 'Google Maps API key not configured',
        token: null 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Returning Google Maps API key:', googleMapsApiKey.substring(0, 10) + '...');
    
    return new Response(JSON.stringify({ 
      token: googleMapsApiKey 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-google-maps-key function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});