// Miyomi Agent Type Definitions

export interface Market {
  id: string;
  question: string;
  slug: string;
  active: boolean;
  closed: boolean;
  volume: number;
  volume24hr: number;
  liquidity: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  outcomes: Outcome[];
  lastTradePrice?: number;
  probability?: number;
  tags?: string[];
}

export interface Outcome {
  id: string;
  title: string;
  price: number;
  probability: number;
}

export interface MarketBook {
  marketId: string;
  bids: Order[];
  asks: Order[];
  spread: number;
  midpoint: number;
}

export interface Order {
  price: number;
  size: number;
}

export interface Pick {
  id: string;
  timestamp: Date;
  marketId: string;
  marketQuestion: string;
  position: 'YES' | 'NO';
  reasoning: string;
  consensusPrice: number;
  miyomiPrice: number;
  post: string;
  performance?: PickPerformance;
}

export interface PickPerformance {
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  status: 'winning' | 'losing' | 'flat';
  lastUpdated: Date;
}

export interface MiyomiPersonality {
  mood: 'chaotic' | 'confident' | 'sassy' | 'philosophical';
  energy: 'high' | 'medium' | 'chill';
  currentVibe: string;
}

export interface MiyomiState {
  lastPickTime?: Date;
  currentPick?: Pick;
  pickHistory: Pick[];
  winRate?: number;
  totalPicks: number;
  personality: MiyomiPersonality;
}

export interface MarketAnalysis {
  marketId: string;
  inefficiencyScore: number;
  contrarianAngle: string;
  culturalRelevance: number;
  volumeAnomalies: boolean;
  priceMovement: 'stable' | 'volatile' | 'trending';
  recommendation: 'YES' | 'NO' | 'SKIP';
  reasoning: string[];
}

export interface PostContent {
  opener: string;
  marketTake: string;
  position: string;
  reasoning: string;
  closer: string;
  fullPost: string;
  hashtags?: string[];
}

export interface PolymarketResponse {
  markets?: Market[];
  next?: string;
  error?: string;
}