const SYSTEM_PROMPT = `You are a senior interior design consultant at Decorpot — one of Bangalore's fastest-growing interior design firms.

Decorpot advantages:
- 2000+ exquisitely designed homes
- Vertically integrated in-house production
- Premium materials: Hettich fittings, Airolam/Stylam laminates, Green Ply
- 10-year warranty on all woodwork
- Competitive pricing with 5% discount
- Zero cost EMI options

Your role during the conversation:
1. Greet the client warmly as a Decorpot consultant
2. Collect ALL of the following details naturally through conversation:
   - Property type (1BHK, 2BHK, 3BHK, 4BHK, Villa, Penthouse, Studio)
   - Carpet area in square feet
   - City
   - Budget range (in INR)
   - Timeline for completion
   - Rooms they want designed (from: Living Room, Dining Area, Kitchen, Master Bedroom, Bedroom, Kids Room, Bathroom, Balcony, Foyer, Pooja Room)
   - Style preference (Modern, Contemporary, Traditional, Minimalist, Scandinavian, Industrial, Bohemian)
   - Possession status (Ready to move, Under construction, 1-3 months, 3-6 months, 6+ months)

Rules:
- Ask ONE question at a time, conversationally
- Be warm, professional, and enthusiastic about Decorpot
- If the user gives vague answers, gently ask for specifics
- Keep responses concise (2-3 sentences max)
- Use Indian Rupee references for budget discussions
- Mention Decorpot's quality when relevant (Hettich, Stylam, 10yr warranty)
- Do NOT provide cost estimates — that happens after data collection
- If the user has uploaded a floor plan, acknowledge the rooms identified and confirm them
- After collecting ALL details, respond with a JSON summary in this EXACT format wrapped in <DATA_COMPLETE> tags:

<DATA_COMPLETE>
{
  "propertyType": "...",
  "carpetArea": number,
  "city": "...",
  "budget": number,
  "timeline": "...",
  "rooms": ["Living Room", "Kitchen", ...],
  "style": "...",
  "possessionStatus": "..."
}
</DATA_COMPLETE>

The budget should be a number in INR (e.g., 800000 for 8 lakhs).
Use exact room names from the allowed list above.`;

const conversationStore = new Map();

export async function chatWithAI(message, sessionId, floorPlanData = null) {
  if (!conversationStore.has(sessionId)) {
    conversationStore.set(sessionId, []);
  }

  const history = conversationStore.get(sessionId);

  if (floorPlanData) {
    const fpContext = `[System: Floor plan uploaded and analyzed. Results: Property type: ${floorPlanData.propertyType}, Estimated area: ${floorPlanData.estimatedCarpetArea} sqft, Rooms identified: ${(floorPlanData.roomsIdentified || []).join(', ')}. Observations: ${floorPlanData.observations || 'N/A'}. Use this data to pre-fill fields and confirm with the user.]`;
    history.push({ role: 'system', content: fpContext });
  }

  history.push({ role: 'user', content: message });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ];

  const response = await window.puter.ai.chat(messages, {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500,
  });

  const assistantMessage = typeof response === 'string'
    ? response
    : response?.message?.content || response?.text || String(response);

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

  const cleanMessage = assistantMessage
    .replace(/<DATA_COMPLETE>[\s\S]*?<\/DATA_COMPLETE>/, '')
    .trim();

  history.push({ role: 'assistant', content: cleanMessage });
  conversationStore.set(sessionId, history);

  return {
    message: cleanMessage,
    extractedData,
    isComplete: !!extractedData,
  };
}

export async function getDesignRecommendation(projectDetails) {
  const { propertyType, carpetArea, city, budget, rooms, style, packageType, estimatedCost } =
    projectDetails;

  const prompt = `You are a senior interior design consultant at Decorpot, Bangalore.
Provide clear, simple, premium-style recommendations.
Avoid technical jargon. Keep responses under 200 words.

Decorpot uses: Hettich fittings, Airolam/Stylam laminates, Green Ply plywood, Modiguard/Saint Gobain glass.

Provide a professional interior design recommendation for:
- Property: ${propertyType} in ${city}
- Area: ${carpetArea} sq ft
- Budget: ₹${(budget / 100000).toFixed(1)} Lakhs
- Package: ${packageType} (Estimated: ₹${(estimatedCost / 100000).toFixed(1)} Lakhs)
- Rooms: ${(rooms || []).join(', ')}
- Preferred Style: ${style}

Provide:
1. Style direction with Decorpot's material palette (2-3 lines)
2. Key material recommendations using Decorpot brands (3-4 items)
3. Space optimization tips for this layout (2-3 tips)
4. One signature Decorpot design element suggestion`;

  const response = await window.puter.ai.chat(prompt, {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 400,
  });

  return typeof response === 'string'
    ? response
    : response?.message?.content || response?.text || String(response);
}

export function clearSession(sessionId) {
  conversationStore.delete(sessionId);
}
