import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      console.error("Invalid journal_text provided");
      return new Response(
        JSON.stringify({ error: "journal_text is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    console.log("Analyzing mood for journal entry:", journal_text.substring(0, 100) + "...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a compassionate mental health AI assistant. Analyze the user's journal entry and provide supportive insights.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "mood_score": <number from 1-10 where 1 is very negative and 10 is very positive>,
  "dominant_emotion": "<primary emotion detected: happy, sad, anxious, calm, stressed, hopeful, angry, grateful, confused, or neutral>",
  "emotional_themes": ["<theme1>", "<theme2>"],
  "advice": "<brief, compassionate advice or affirmation in 2-3 sentences>",
  "self_care_suggestion": "<one specific self-care activity recommendation>"
}`
          },
          {
            role: "user",
            content: journal_text
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response");
      throw new Error("Invalid AI response");
    }

    console.log("AI response content:", content);

    // Parse the JSON response
    let analysis;
    try {
      // Clean the response in case there's markdown formatting
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a default analysis if parsing fails
      analysis = {
        mood_score: 5,
        dominant_emotion: "neutral",
        emotional_themes: ["reflection"],
        advice: "Thank you for sharing your thoughts. Taking time to journal is a positive step for your mental wellbeing.",
        self_care_suggestion: "Consider taking a short walk or doing some deep breathing exercises."
      };
    }

    console.log("Analysis complete:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in analyze-mood function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});