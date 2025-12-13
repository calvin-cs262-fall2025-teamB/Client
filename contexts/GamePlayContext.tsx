/**
 * GamePlayContext
 *
 * This context is reserved for future implementation of gameplay state management.
 * It will handle active adventure state, token collection, and gameplay progression.
 *
 * PLANNED FEATURES:
 * - Active adventure tracking
 * - Token collection state
 * - Progress tracking during gameplay
 * - Real-time location-based token detection
 *
 * STATUS: Not yet implemented
 * TODO: Implement when gameplay features are finalized
 */

import { createContext, useContext, ReactNode } from "react";

// Placeholder type for future implementation
interface GamePlayState {
  activeAdventure: null;
  collectedTokens: never[];
  currentProgress: number;
}

const GamePlayContext = createContext<GamePlayState | undefined>(undefined);

interface GamePlayProviderProps {
  children: ReactNode;
}

export function GamePlayProvider({ children }: GamePlayProviderProps) {
  // Placeholder state - will be implemented with useReducer pattern
  const state: GamePlayState = {
    activeAdventure: null,
    collectedTokens: [],
    currentProgress: 0,
  };

  return (
    <GamePlayContext.Provider value={state}>
      {children}
    </GamePlayContext.Provider>
  );
}

export function useGamePlay() {
  const context = useContext(GamePlayContext);
  if (context === undefined) {
    throw new Error("useGamePlay must be used within a GamePlayProvider");
  }
  return context;
}
