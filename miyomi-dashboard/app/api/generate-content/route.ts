import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { market } = await request.json();
    
    if (!market) {
      return NextResponse.json({ error: 'Market required' }, { status: 400 });
    }

    // Generate Miyomi-style content based on market
    const position = market.position;
    const price = market.currentPrice;
    const title = market.title;
    const reasoning = market.reasoning || [];
    
    // Different styles for different market types
    const styles = [
      // Party girl energy
      {
        template: `Okay but why is everyone ${position === 'YES' ? 'sleeping on' : 'overconfident about'} this??? 😭\n\n"${title}"\n\n${position} @ ${price}¢ is literally free money rn\n\n${reasoning[0] || 'The data doesn\'t lie babes'} 💅\n\nWho\'s taking this with me? Drop a 🚀 if you\'re in`,
        vibe: 'viral'
      },
      // Sophisticated trader
      {
        template: `Contrarian play of the day:\n\n${title}\n\nPosition: ${position} @ ${price}¢\n\nThesis:\n${reasoning.map((r: string) => `• ${r}`).join('\n')}\n\nMarket's giving us a gift here. Taking size.`,
        vibe: 'professional'
      },
      // NYC energy
      {
        template: `NYC KNOWS 🗽\n\nWhile y'all panic about "${title.substring(0, 40)}..."\n\nI'm loading ${position} at ${price}¢\n\n${reasoning[0] || 'Market consensus is wrong AGAIN'}\n\nLES > Wall Street any day 💯`,
        vibe: 'local'
      },
      // Data-driven
      {
        template: `Data check ✅\n\n"${title}"\n\nCurrent: ${price}¢ ${position}\nTarget: ${position === 'YES' ? Math.min(price + 30, 85) : Math.max(price - 30, 15)}¢\nScore: ${(market.score * 100).toFixed(0)}%\n\n${reasoning.slice(0, 2).join(' | ')}\n\nNumbers don't lie. I'm in.`,
        vibe: 'analytical'
      },
      // Dismissive/confident
      {
        template: `LOL the market really thinks ${position === 'YES' ? 'this won\'t happen' : 'this is guaranteed'} 🙄\n\n"${title}"\n\n${position} @ ${price}¢ because ${reasoning[0]?.toLowerCase() || 'obviously'}\n\nNGMI if you're not seeing this`,
        vibe: 'cocky'
      }
    ];

    // Pick style based on market characteristics
    let selectedStyle;
    if (title.toLowerCase().includes('bitcoin') || title.toLowerCase().includes('crypto')) {
      selectedStyle = styles[0]; // viral for crypto
    } else if (title.toLowerCase().includes('recession') || title.toLowerCase().includes('economy')) {
      selectedStyle = styles[3]; // analytical for economy
    } else if (price < 20 || price > 80) {
      selectedStyle = styles[4]; // cocky for extreme prices
    } else {
      selectedStyle = styles[Math.floor(Math.random() * styles.length)];
    }

    // Add time-based variations
    const hour = new Date().getHours();
    let timeContext = '';
    if (hour >= 9 && hour <= 10) {
      timeContext = 'Morning pick 📈\n\n';
    } else if (hour >= 11 && hour <= 13) {
      timeContext = 'Daily Chick\'s Pick 🎯\n\n';
    } else if (hour >= 15 && hour <= 16) {
      timeContext = 'Power hour play 🔥\n\n';
    }

    const content = timeContext + selectedStyle.template;

    return NextResponse.json({
      success: true,
      content,
      style: selectedStyle.vibe,
      market: {
        title,
        position,
        price,
        score: market.score
      }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate content',
      content: 'Today\'s contrarian pick is loading...' 
    }, { status: 500 });
  }
}