// Supabase Cloud State Manager for Miyomi
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pick, MiyomiState, PickPerformance } from '../types';

export class SupabaseManager {
  private supabase: SupabaseClient | null = null;
  private isEnabled: boolean = false;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    
    if (url && key) {
      this.supabase = createClient(url, key);
      this.isEnabled = true;
      console.log('✅ Supabase connected');
    } else {
      console.log('📝 Supabase not configured, using local storage');
    }
  }

  async savePick(pick: Pick): Promise<void> {
    if (!this.isEnabled || !this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('miyomi_picks')
        .insert({
          id: pick.id,
          timestamp: pick.timestamp,
          market_id: pick.marketId,
          market_question: pick.marketQuestion,
          position: pick.position,
          reasoning: pick.reasoning,
          consensus_price: pick.consensusPrice,
          miyomi_price: pick.miyomiPrice,
          post: pick.post
        });

      if (error) throw error;
      console.log('✅ Pick saved to Supabase');
    } catch (error) {
      console.error('Error saving pick to Supabase:', error);
    }
  }

  async updatePerformance(pickId: string, performance: PickPerformance): Promise<void> {
    if (!this.isEnabled || !this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('miyomi_performance')
        .upsert({
          pick_id: pickId,
          current_price: performance.currentPrice,
          pnl: performance.pnl,
          pnl_percent: performance.pnlPercent,
          status: performance.status,
          last_updated: performance.lastUpdated
        });

      if (error) throw error;
      console.log('✅ Performance updated in Supabase');
    } catch (error) {
      console.error('Error updating performance:', error);
    }
  }

  async getRecentPicks(limit: number = 10): Promise<Pick[]> {
    if (!this.isEnabled || !this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('miyomi_picks')
        .select(`
          *,
          miyomi_performance (*)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        timestamp: new Date(row.timestamp),
        marketId: row.market_id,
        marketQuestion: row.market_question,
        position: row.position,
        reasoning: row.reasoning,
        consensusPrice: row.consensus_price,
        miyomiPrice: row.miyomi_price,
        post: row.post,
        performance: row.miyomi_performance ? {
          currentPrice: row.miyomi_performance.current_price,
          pnl: row.miyomi_performance.pnl,
          pnlPercent: row.miyomi_performance.pnl_percent,
          status: row.miyomi_performance.status,
          lastUpdated: new Date(row.miyomi_performance.last_updated)
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching picks from Supabase:', error);
      return [];
    }
  }

  async savePersonalityState(state: MiyomiState): Promise<void> {
    if (!this.isEnabled || !this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('miyomi_personality')
        .upsert({
          id: 1, // Single row for current state
          mood: state.personality.mood,
          energy: state.personality.energy,
          current_vibe: state.personality.currentVibe,
          win_rate: state.winRate,
          total_picks: state.totalPicks,
          updated_at: new Date()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving personality state:', error);
    }
  }

  async getStats(): Promise<any> {
    if (!this.isEnabled || !this.supabase) return null;

    try {
      // Get total picks and win rate
      const { data: picks, error: picksError } = await this.supabase
        .from('miyomi_picks')
        .select('*, miyomi_performance(status)');

      if (picksError) throw picksError;

      const totalPicks = picks.length;
      const wins = picks.filter(p => p.miyomi_performance?.status === 'winning').length;
      const winRate = totalPicks > 0 ? (wins / totalPicks) * 100 : 0;

      // Get best performing pick
      const { data: bestPick, error: bestError } = await this.supabase
        .from('miyomi_performance')
        .select('*, miyomi_picks(*)')
        .order('pnl_percent', { ascending: false })
        .limit(1)
        .single();

      if (bestError) console.error('Error getting best pick:', bestError);

      return {
        totalPicks,
        wins,
        winRate: winRate.toFixed(1),
        bestPick: bestPick?.miyomi_picks
      };
    } catch (error) {
      console.error('Error getting stats from Supabase:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.isEnabled;
  }
}