/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Game, GameState, Shot, Team, Period, ShotType, ShotResult } from '../types';
import { storage } from '../utils/storage';

type GameAction =
  | { type: 'START_GAME'; payload: { homeTeam: string; awayTeam: string } }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_PERIOD'; payload: Period }
  | { type: 'SELECT_TEAM'; payload: Team }
  | { type: 'ADD_SHOT'; payload: Shot }
  | { type: 'REMOVE_SHOT'; payload: string }
  | { type: 'UNDO_LAST_SHOT' }
  | { type: 'LOAD_GAME'; payload: Game };

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: (homeTeam: string, awayTeam: string) => void;
  endGame: () => void;
  resetGame: () => void;
  setPeriod: (period: Period) => void;
  selectTeam: (team: Team) => void;
  addShot: (x: number, y: number, shotType: ShotType, result: ShotResult) => void;
  removeShot: (id: string) => void;
  undoLastShot: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
  game: null,
  isGameActive: false,
  selectedTeam: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const game: Game = {
        id: uuidv4(),
        date: new Date().toISOString(),
        homeTeam: action.payload.homeTeam,
        awayTeam: action.payload.awayTeam,
        currentPeriod: 1,
        shots: [],
      };
      storage.saveGame(game);
      storage.addRecentTeam(action.payload.homeTeam);
      storage.addRecentTeam(action.payload.awayTeam);
      return {
        ...state,
        game,
        isGameActive: true,
      };
    }

    case 'END_GAME':
      storage.clearGame();
      return initialState;

    case 'RESET_GAME':
      if (state.game) {
        const resetGame: Game = {
          ...state.game,
          id: uuidv4(),
          date: new Date().toISOString(),
          currentPeriod: 1,
          shots: [],
        };
        storage.saveGame(resetGame);
        return {
          ...state,
          game: resetGame,
          selectedTeam: null,
        };
      }
      return state;

    case 'SET_PERIOD':
      if (state.game) {
        const updatedGame = { ...state.game, currentPeriod: action.payload };
        storage.saveGame(updatedGame);
        return { ...state, game: updatedGame };
      }
      return state;

    case 'SELECT_TEAM':
      return { ...state, selectedTeam: action.payload };

    case 'ADD_SHOT':
      if (state.game) {
        const updatedGame = {
          ...state.game,
          shots: [...state.game.shots, action.payload],
        };
        storage.saveGame(updatedGame);
        return {
          ...state,
          game: updatedGame,
        };
      }
      return state;

    case 'REMOVE_SHOT':
      if (state.game) {
        const updatedGame = {
          ...state.game,
          shots: state.game.shots.filter(shot => shot.id !== action.payload),
        };
        storage.saveGame(updatedGame);
        return { ...state, game: updatedGame };
      }
      return state;

    case 'UNDO_LAST_SHOT':
      if (state.game && state.game.shots.length > 0) {
        const updatedGame = {
          ...state.game,
          shots: state.game.shots.slice(0, -1),
        };
        storage.saveGame(updatedGame);
        return { ...state, game: updatedGame };
      }
      return state;

    case 'LOAD_GAME':
      return {
        ...state,
        game: action.payload,
        isGameActive: true,
      };

    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load game from storage on mount
  useEffect(() => {
    const savedGame = storage.loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
    }
  }, []);

  const startGame = (homeTeam: string, awayTeam: string) => {
    dispatch({ type: 'START_GAME', payload: { homeTeam, awayTeam } });
  };

  const endGame = () => {
    dispatch({ type: 'END_GAME' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const setPeriod = (period: Period) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
  };

  const selectTeam = (team: Team) => {
    dispatch({ type: 'SELECT_TEAM', payload: team });
  };

  const addShot = (x: number, y: number, shotType: ShotType, result: ShotResult) => {
    if (!state.game || !state.selectedTeam) return;

    const shot: Shot = {
      id: uuidv4(),
      period: state.game.currentPeriod,
      timestamp: Date.now(),
      team: state.selectedTeam,
      x,
      y,
      shotType,
      result,
    };

    dispatch({ type: 'ADD_SHOT', payload: shot });
  };

  const removeShot = (id: string) => {
    dispatch({ type: 'REMOVE_SHOT', payload: id });
  };

  const undoLastShot = () => {
    dispatch({ type: 'UNDO_LAST_SHOT' });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startGame,
        endGame,
        resetGame,
        setPeriod,
        selectTeam,
        addShot,
        removeShot,
        undoLastShot,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
