// State Management for Miyomi
import fs from 'fs';
import path from 'path';
import { MiyomiState, Pick } from '../types';

export class StateManager {
  private statePath: string;

  constructor() {
    this.statePath = path.join(process.cwd(), 'miyomi-state.json');
  }

  loadState(): MiyomiState {
    try {
      if (fs.existsSync(this.statePath)) {
        const data = fs.readFileSync(this.statePath, 'utf-8');
        const state = JSON.parse(data);
        
        // Convert date strings back to Date objects
        if (state.lastPickTime) {
          state.lastPickTime = new Date(state.lastPickTime);
        }
        if (state.pickHistory) {
          state.pickHistory = state.pickHistory.map((pick: any) => ({
            ...pick,
            timestamp: new Date(pick.timestamp),
            performance: pick.performance ? {
              ...pick.performance,
              lastUpdated: new Date(pick.performance.lastUpdated)
            } : undefined
          }));
        }
        
        return state;
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }

    // Return default state
    return {
      pickHistory: [],
      totalPicks: 0,
      personality: {
        mood: 'confident',
        energy: 'high',
        currentVibe: 'market oracle'
      }
    };
  }

  saveState(state: MiyomiState): void {
    try {
      fs.writeFileSync(
        this.statePath,
        JSON.stringify(state, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  getRecentPicks(days: number = 7): Pick[] {
    const state = this.loadState();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return state.pickHistory.filter(pick => 
      pick.timestamp > cutoff
    );
  }

  getWinRate(): number {
    const state = this.loadState();
    if (state.pickHistory.length === 0) return 0;
    
    const wins = state.pickHistory.filter(pick => 
      pick.performance && pick.performance.status === 'winning'
    ).length;
    
    return wins / state.pickHistory.length;
  }

  getBestPick(): Pick | null {
    const state = this.loadState();
    if (state.pickHistory.length === 0) return null;
    
    return state.pickHistory.reduce((best, current) => {
      if (!current.performance) return best;
      if (!best || !best.performance) return current;
      
      return current.performance.pnlPercent > best.performance.pnlPercent 
        ? current : best;
    });
  }

  getWorstPick(): Pick | null {
    const state = this.loadState();
    if (state.pickHistory.length === 0) return null;
    
    return state.pickHistory.reduce((worst, current) => {
      if (!current.performance) return worst;
      if (!worst || !worst.performance) return current;
      
      return current.performance.pnlPercent < worst.performance.pnlPercent 
        ? current : worst;
    });
  }

  clearOldPicks(daysToKeep: number = 30): void {
    const state = this.loadState();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    state.pickHistory = state.pickHistory.filter(pick => 
      pick.timestamp > cutoff
    );
    
    this.saveState(state);
  }
}