import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, location, chatHistory } = await req.json();
    console.log('Chat request:', { message, userId, location });

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Prepare context with safety information
    let contextInfo = "";
    if (location) {
      // Get recent incidents near location
      const { data: incidents } = await supabase
        .from('safety_incidents')
        .select('*')
        .eq('verified', true)
        .limit(5);
      
      // Get risk factors for area
      const { data: riskFactors } = await supabase
        .from('risk_factors')
        .select('*')
        .limit(5);

      if (incidents?.length > 0) {
        contextInfo += `Recent verified incidents in area: ${incidents.map(i => `${i.incident_type} (severity: ${i.severity}/10) at ${i.location_name}`).join(', ')}. `;
      }
      
      if (riskFactors?.length > 0) {
        contextInfo += `Area risk factors: ${riskFactors.map(r => `${r.factor_type} (risk level: ${r.risk_level}/10) at ${r.location_name}`).join(', ')}. `;
      }
    }

    // Build conversation history for context
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.map((msg: any) => 
        `${msg.role}: ${msg.content}`
      ).join('\n');
    }

    const systemPrompt = `You are GuardianAI, a women's safety assistant. You provide helpful, accurate, and supportive information about:
    - Route safety and risk assessment
    - Emergency procedures and contacts
    - Crime prevention tips
    - Personal safety strategies
    - Legal rights and resources
    - Mental health support
    
    Current safety context: ${contextInfo}
    
    Guidelines:
    - Be empathetic and supportive
    - Provide practical, actionable advice
    - Include emergency numbers when relevant (India: Police-100, Women Helpline-1091, Emergency-108)
    - Encourage reporting incidents to authorities
    - Prioritize user safety and well-being
    - Be culturally sensitive for Indian context
    - Provide information in both English and Hindi when helpful`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nPrevious conversation:\n${conversationContext}\n\nUser question: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';

    // Save chat session if userId provided
    if (userId) {
      try {
        // Check if there's an active chat session
        const { data: existingSession } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('session_type', 'safety_chat')
          .single();

        const messages = [
          ...(existingSession?.messages as any[] || []),
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() }
        ];

        if (existingSession) {
          await supabase
            .from('chat_sessions')
            .update({ 
              messages: messages,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSession.id);
        } else {
          await supabase
            .from('chat_sessions')
            .insert({
              user_id: userId,
              session_type: 'safety_chat',
              messages: messages,
              is_active: true
            });
        }
      } catch (error) {
        console.error('Error saving chat session:', error);
      }
    }

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in safety-chat-assistant:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});