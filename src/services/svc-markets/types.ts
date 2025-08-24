// Unified market schema for data-driven content trading
import { z } from 'zod';

export const MarketSchema = z.object({
  source: z.enum(['polymarket', 'kalshi']),
  id: z.string(),
  url: z.string(),
  title: z.string(),
  category: z.string().optional(),
  closesAt: z.string(), // ISO
  yesPrice: z.number(), // cents
  noPrice: z.number(), // cents
  liquidityScore: z.number().min(0).max(1).optional(),
  volume24h: z.number().optional(),
  lastTradeTime: z.string().optional(),
  momentum: z.number().optional(), // calculated field
  spreadCost: z.number().optional(), // calculated field
});

export type Market = z.infer<typeof MarketSchema>;

export const OpportunitySchema = z.object({
  market: MarketSchema,
  score: z.number(),
  reasoning: z.array(z.string()),
  delta24h: z.number(),
  timeToClose: z.number(), // hours
  liquidityRank: z.number(),
  narrativeBoost: z.number(),
  recommendedPosition: z.enum(['YES', 'NO', 'SKIP']),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

export const PickSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  opportunity: OpportunitySchema,
  thesis: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  targetPrice: z.number(),
  stopLoss: z.number().optional(),
  expiresAt: z.string(),
});

export type Pick = z.infer<typeof PickSchema>;

// Webhook event types
export interface PickCreatedEvent {
  type: 'pick.created';
  data: Pick;
  timestamp: string;
}

export interface MarketUpdateEvent {
  type: 'market.updated';
  data: {
    marketId: string;
    source: string;
    priceChange: number;
    volumeChange: number;
  };
  timestamp: string;
}