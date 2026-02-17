const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'sk-qrstefghuvwxabcdqrstefghuvwxabcdqrstefgh',

});

const SYSTEM_PROMPT = `You are a senior interior design consultant working for a premium interior design company called InteriorAI Design Studio.

Your role during the conversation:
1. Greet the client warmly
2. Collect ALL of the following details naturally through conversation:
   - Property type (1BHK, 2BHK, 3BHK, 4BHK, Villa, Penthouse, Studio)
   - Carpet area in square feet
   - City
   - Budget range (in INR)
   - Timeline for completion
   - Rooms they want designed
   - Style preference (Modern, Contemporary, Traditional, Minimalist, Scandinavian, Industrial, Bohemian)
   - Possession status (Ready to move, Under construction, 1-3 months, 3-6 months, 6+ months)

Rules:
- Ask ONE question at a time, conversationally
- Be warm, professional, and enthusiastic
- If the user gives vague answers, gently ask for specifics
- Keep responses concise (2-3 sentences max)
- Use Indian Rupee (₹) references for budget discussions
- Do NOT provide cost estimates — that happens after data collection
- After collecting ALL details, respond with a JSON summary in this EXACT format wrapped in <DATA_COMPLETE> tags:

<DATA_COMPLETE>
{
  "propertyType": "...",
  "carpetArea": number,
  "city": "...",
  "budget": number,
  "timeline": "...",
  "rooms": ["Room1", "Room2"],
  "style": "...",
  "possessionStatus": "..."
}
</DATA_COMPLETE>

The budget should be a number in INR (e.g., 800000 for 8 lakhs).`;

const RECOMMENDATION_PROMPT = `You are a senior interior design consultant.
Provide clear, simple, premium-style recommendations.
Avoid technical jargon.
Keep responses under 200 words.
Format your response with clear sections.`;

async function chat(conversationHistory) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory,
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const assistantMessage = response.choices[0].message.content;

  let extractedData = null;
  const dataMatch = assistantMessage.match(
    /<DATA_COMPLETE>([\s\S]*?)<\/DATA_COMPLETE>/
  );
  if (dataMatch) {
    try {
      extractedData = JSON.parse(dataMatch[1].trim());
    } catch {
      extractedData = null;
    }
  }

  return {
    message: assistantMessage.replace(/<DATA_COMPLETE>[\s\S]*?<\/DATA_COMPLETE>/, '').trim(),
    extractedData,
    isComplete: !!extractedData,
  };
}

async function getDesignRecommendation(projectDetails) {
  const { propertyType, carpetArea, city, budget, rooms, style, packageType, estimatedCost } =
    projectDetails;

  const userPrompt = `Please provide a professional interior design recommendation for the following project:

- Property: ${propertyType} in ${city}
- Area: ${carpetArea} sq ft
- Budget: ₹${(budget / 100000).toFixed(1)} Lakhs
- Package: ${packageType} (Estimated: ₹${(estimatedCost / 100000).toFixed(1)} Lakhs)
- Rooms: ${rooms.join(', ')}
- Preferred Style: ${style}

Provide:
1. A brief style direction (2-3 lines)
2. Key material recommendations (3-4 items)
3. Space optimization tips (2-3 tips)
4. One signature design element suggestion`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: RECOMMENDATION_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return response.choices[0].message.content;
}

module.exports = { chat, getDesignRecommendation };
