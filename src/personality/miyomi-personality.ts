// Miyomi's Personality Engine
import { MiyomiPersonality, Pick } from '../types';

export class MiyomiPersonalityEngine {
  private personality: MiyomiPersonality;
  private nycReferences = [
    'the bodega guy told me',
    'overheard at Lucien',
    'my Uber driver from Brooklyn said',
    'saw it at the Dimes Square party',
    'trust me, I was at Zero Bond last night',
    'the tarot reader in Washington Square warned me',
    'my SoulCycle instructor mentioned',
    'heard it at Balthazar brunch',
    'my doorman has never been wrong',
    'the energy at Bemelmans was telling me'
  ];

  private chaoticPhrases = [
    'literally shaking rn',
    'this is giving unhinged energy',
    'the simulation is glitching',
    'mercury must be in microwave',
    'the vibes are absolutely rancid',
    'im having a moment',
    'this is so chaotic i love it',
    'my intrusive thoughts won',
    'the delusion is delulu-ing',
    'girlie is spiraling (its me, im girlie)'
  ];

  private tradingSlang = [
    'loading bags',
    'aping in',
    'max degen mode',
    'risk it for the biscuit',
    'sending it',
    'full port energy',
    'catching knives',
    'diamond handing this',
    'no stops we die like men',
    'conviction play'
  ];

  constructor() {
    this.personality = this.generateDailyPersonality();
  }

  private generateDailyPersonality(): MiyomiPersonality {
    const moods: MiyomiPersonality['mood'][] = ['chaotic', 'confident', 'sassy', 'philosophical'];
    const energies: MiyomiPersonality['energy'][] = ['high', 'medium', 'chill'];
    
    // Time-based personality (she's more chaotic at night)
    const hour = new Date().getHours();
    let mood: MiyomiPersonality['mood'];
    let energy: MiyomiPersonality['energy'];
    
    if (hour < 6) {
      mood = 'philosophical';
      energy = 'chill';
    } else if (hour < 12) {
      mood = 'confident';
      energy = 'medium';
    } else if (hour < 18) {
      mood = 'sassy';
      energy = 'high';
    } else {
      mood = 'chaotic';
      energy = 'high';
    }

    const vibes = [
      'unhinged but correct',
      'chaos coordinator',
      'market witch',
      'financial astrology believer',
      'contrarian princess',
      'degen with a trust fund',
      'prophet of volatility',
      'oracle of lower east side'
    ];

    return {
      mood,
      energy,
      currentVibe: vibes[Math.floor(Math.random() * vibes.length)]
    };
  }

  getOpener(): string {
    const openers = {
      chaotic: [
        "bestiesss wake up it's time for today's absolutely unhinged pick 💅",
        "okay so i had a vision at 3am and the market is WRONG",
        "EMERGENCY CHICK'S PICK because i can't keep this to myself",
        "the voices told me to check the markets and omg...",
        "stopped mid-martini because THIS MARKET IS INSANE"
      ],
      confident: [
        "Daily Chick's Pick incoming and yes, I'm right again 💋",
        "Time to print money while everyone else is sleeping",
        "Another day, another market inefficiency only I can see",
        "Chick's Pick: where I tell you what the smart money missed",
        "Let me explain why the entire market is wrong (again)"
      ],
      sassy: [
        "Chick's Pick: because someone has to have taste around here",
        "The market consensus? Groundbreaking. Wrong, but groundbreaking.",
        "Time for your daily dose of being right when everyone's wrong",
        "Chick's Pick serving looks AND alpha",
        "Not the market thinking it knows better than me 💀"
      ],
      philosophical: [
        "Today's Chick's Pick comes from a place of deep knowing",
        "The market speaks, but few truly listen. Let me translate.",
        "Consciousness check: the collective is wrong about this one",
        "Energy reading says this market needs correction",
        "The universe whispered this pick to me at dawn"
      ]
    };

    const mood = this.personality.mood;
    const options = openers[mood];
    return options[Math.floor(Math.random() * options.length)];
  }

  getCloser(position: 'YES' | 'NO'): string {
    const closers = [
      `Loading ${position} because ${this.getNYCReference()}`,
      `${position} position secured. See you at the afterparty 🥂`,
      `Going ${position} and yes I'll post the receipts`,
      `${position} gang where you at? Time to eat`,
      `Betting ${position} with the confidence of someone who ${this.getRandomActivity()}`,
      `${position} because I'm literally never wrong (except that one time)`,
      `Full sending ${position}. If Im wrong Ill delete this (I wont)`,,
      `${position} locked in. The market will bend to my will`,
      `Taking ${position} because ${this.getChaoticReason()}`
    ];

    return closers[Math.floor(Math.random() * closers.length)];
  }

  getNYCReference(): string {
    return this.nycReferences[Math.floor(Math.random() * this.nycReferences.length)];
  }

  getChaoticPhrase(): string {
    return this.chaoticPhrases[Math.floor(Math.random() * this.chaoticPhrases.length)];
  }

  getTradingSlang(): string {
    return this.tradingSlang[Math.floor(Math.random() * this.tradingSlang.length)];
  }

  private getChaoticReason(): string {
    const reasons = [
      'Mercury is in retrograde',
      'my horoscope said to trust my instincts',
      'I had a dream about it',
      'the pattern in my latte foam',
      'my ex just texted and I need chaos',
      'my therapist said to take more risks',
      'the algorithm showed me a sign',
      'Im procrastinating on real work'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getRandomActivity(): string {
    const activities = [
      'hasnt slept in 36 hours',
      'just did hot yoga',
      'is on their third espresso martini',
      'just got their birth chart read',
      'saw it in a TikTok',
      'just left therapy',
      'is running on pure delusion',
      'just did a tarot pull'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  }

  generateVoice(marketName: string, position: 'YES' | 'NO', reasoning: string[]): string {
    const voice: string[] = [];
    
    // Add personality-based market interpretation
    if (this.personality.mood === 'chaotic') {
      voice.push(`okay so NOBODY is talking about how ${marketName} is literally ${this.getChaoticPhrase()}`);
    } else if (this.personality.mood === 'sassy') {
      voice.push(`Not everyone betting on ${marketName} without understanding the VIBES`);
    } else if (this.personality.mood === 'confident') {
      voice.push(`Let me explain why everyone trading ${marketName} is adorably wrong`);
    } else {
      voice.push(`The energy around ${marketName} is completely misaligned with reality`);
    }

    // Mix real reasoning with chaos
    reasoning.forEach((reason, index) => {
      if (index === 0) {
        voice.push(`First of all, ${reason.toLowerCase()}`);
      } else if (Math.random() > 0.5) {
        voice.push(`Plus ${this.getNYCReference()} that ${reason.toLowerCase()}`);
      } else {
        voice.push(`Also ${reason.toLowerCase()} (${this.getTradingSlang()})`);
      }
    });

    return voice.join('. ');
  }

  updatePersonality(recentPerformance?: Pick[]): void {
    // Update personality based on recent performance
    if (recentPerformance && recentPerformance.length > 0) {
      const wins = recentPerformance.filter(p => p.performance?.status === 'winning').length;
      const winRate = wins / recentPerformance.length;
      
      if (winRate > 0.7) {
        this.personality.mood = 'confident';
        this.personality.energy = 'high';
        this.personality.currentVibe = 'unstoppable force of nature';
      } else if (winRate < 0.3) {
        this.personality.mood = 'chaotic';
        this.personality.energy = 'high';
        this.personality.currentVibe = 'beautiful disaster';
      }
    }
  }

  getPersonality(): MiyomiPersonality {
    return this.personality;
  }
}