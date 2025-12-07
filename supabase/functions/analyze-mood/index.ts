import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { journal_text } = await req.json();
    
    if (!journal_text || typeof journal_text !== 'string') {
      return new Response(
        JSON.stringify({ error: "journal_text is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a compassionate mental health AI assistant. Analyze the following journal entry.
      
      Entry: "${journal_text}"

      Return ONLY valid JSON (no markdown formatting, no backticks) in this exact format:
      {
        "mood_score": <number 1-10>,
        "dominant_emotion": "<one word emotion>",
        "emotional_themes": ["<theme1>", "<theme2>"],
        "advice": "<2-3 sentences of advice>",
        "self_care_suggestion": "<one specific activity>"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up if Gemini adds markdown backticks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const analysis = JSON.parse(text);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});