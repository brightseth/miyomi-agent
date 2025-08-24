// Test different content generation styles for Miyomi
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { MiyomiPersonalityEngine } from './personality/miyomi-personality';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const personality = new MiyomiPersonalityEngine();

// Test market for content generation
const testMarket = {
  id: 'test-btc',
  question: 'Will Bitcoin reach $100k before March 2025?',
  outcomes: [{ name: 'YES', probability: 0.45 }, { name: 'NO', probability: 0.55 }]
};

const testAnalysis = {
  recommendation: 'YES' as const,
  reasoning: [
    'Volume spike with no news indicates whale accumulation',
    'Market sentiment is overly bearish despite strong fundamentals',
    'Technical indicators showing hidden bullish divergence'
  ]
};

async function testContentVariation(style: string, prompt: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error(`Error generating ${style}:`, error);
    return '';
  }
}

async function testAllStyles() {
  console.log('🎭 Testing Miyomi Content Variations\n');
  
  // Current style
  const currentStyle = `You are Miyomi, a 20-something prediction market trader from Lower East Side NYC. 
  
  Market: ${testMarket.question}
  Current consensus: ${(testMarket.outcomes[0].probability * 100).toFixed(0)}% YES
  Your position: ${testAnalysis.recommendation}
  Your reasoning: ${testAnalysis.reasoning.join('; ')}
  
  Create a social media post mixing sophisticated trading knowledge with chaotic party girl energy.
  Use gen-z language, NYC references, and questionable logic. Keep it under 280 characters.`;

  // Enhanced storytelling style
  const storytellingStyle = `You are Miyomi posting a "Chick's Pick" prediction.
  
  Market: ${testMarket.question} (consensus: 45% YES, you pick YES)
  
  Tell a micro-story about your prediction that includes:
  - A specific NYC moment/person that "told" you this info
  - Your unique analysis mixing vibes with actual market data
  - A confident prediction with personality
  
  Style: Confident NYC party girl who secretly knows finance. 200-280 chars.`;

  // Visual description style
  const visualStyle = `You are Miyomi creating a prediction post that will have a visual component.
  
  Market: ${testMarket.question}
  Position: YES (against 45% consensus)
  
  Create content that:
  1. Describes the "vibe" or "energy" you're seeing in the market visually
  2. Uses metaphors that could be turned into images (chaos, energy, waves, etc.)
  3. Includes a call to action for your followers
  
  Think about what image or video would accompany this post. Be vivid and visual.`;

  // Test each style
  console.log('═══════════════════════════════════════');
  console.log('📱 CURRENT STYLE');
  console.log('═══════════════════════════════════════');
  const current = await testContentVariation('current', currentStyle);
  console.log(current);
  console.log(`\nLength: ${current.length} chars\n`);

  console.log('═══════════════════════════════════════');
  console.log('📖 STORYTELLING STYLE');
  console.log('═══════════════════════════════════════');
  const storytelling = await testContentVariation('storytelling', storytellingStyle);
  console.log(storytelling);
  console.log(`\nLength: ${storytelling.length} chars\n`);

  console.log('═══════════════════════════════════════');
  console.log('🎨 VISUAL STYLE');
  console.log('═══════════════════════════════════════');
  const visual = await testContentVariation('visual', visualStyle);
  console.log(visual);
  console.log(`\nLength: ${visual.length} chars\n`);

  // Test personality combinations
  console.log('═══════════════════════════════════════');
  console.log('🎭 PERSONALITY COMPONENTS');
  console.log('═══════════════════════════════════════');
  console.log('Current personality:', personality.getPersonality());
  console.log('Random opener:', personality.getOpener());
  console.log('Random voice:', personality.generateVoice(testMarket.question, 'YES', testAnalysis.reasoning));
  console.log('Random closer:', personality.getCloser('YES'));
}

testAllStyles();