import type { Game } from '../types';

const GAME_STORAGE_KEY = 'hockey_current_game';
const PREFERENCES_KEY = 'hockey_preferences';

export interface Preferences {
  recentTeams: string[];
  hapticFeedback: boolean;
}

export const storage = {
  // Session Storage (current game)
  saveGame: (game: Game): void => {
    try {
      sessionStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game));
    } catch (error) {
      console.error('Failed to save game to sessionStorage:', error);
    }
  },

  loadGame: (): Game | null => {
    try {
      const data = sessionStorage.getItem(GAME_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load game from sessionStorage:', error);
      return null;
    }
  },

  clearGame: (): void => {
    try {
      sessionStorage.removeItem(GAME_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear game from sessionStorage:', error);
    }
  },

  // Local Storage (preferences)
  savePreferences: (preferences: Preferences): void => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
    }
  },

  loadPreferences: (): Preferences => {
    try {
      const data = localStorage.getItem(PREFERENCES_KEY);
      return data ? JSON.parse(data) : { recentTeams: [], hapticFeedback: true };
    } catch (error) {
      console.error('Failed to load preferences from localStorage:', error);
      return { recentTeams: [], hapticFeedback: true };
    }
  },

  addRecentTeam: (teamName: string): void => {
    const prefs = storage.loadPreferences();
    const recentTeams = [teamName, ...prefs.recentTeams.filter(t => t !== teamName)].slice(0, 5);
    storage.savePreferences({ ...prefs, recentTeams });
  },
};
