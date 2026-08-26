import { useReducer, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type Action<T> =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET'; payload: T | ((prev: T) => T) }
  | { type: 'RESET'; payload: T };

function historyReducer<T>(state: HistoryState<T>, action: Action<T>): HistoryState<T> {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    case 'REDO':
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    case 'SET':
      const newPresent = typeof action.payload === 'function' 
        ? (action.payload as Function)(present) 
        : action.payload;
      
      // Optimization: if state didn't change (e.g. strict equality), do nothing
      if (present === newPresent) return state;

      const updatedPast = [...past, present];
      if (updatedPast.length > 50) updatedPast.shift(); // Max 50 states

      return {
        past: updatedPast,
        present: newPresent,
        future: [],
      };
    case 'RESET':
      return {
        past: [],
        present: action.payload,
        future: [],
      };
    default:
      return state;
  }
}

export function useHistoryState<T>(initialState: T) {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const setState = useCallback((payload: T | ((prev: T) => T)) => dispatch({ type: 'SET', payload }), []);
  const resetHistory = useCallback((payload: T) => dispatch({ type: 'RESET', payload }), []);

  return {
    state: state.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
