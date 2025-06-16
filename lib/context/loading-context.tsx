"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react";

// State type
type State = {
  isLoading: boolean;
};

// Action types
type Action = { type: "START_LOADING" } | { type: "STOP_LOADING" };

// Initial state
const initialState: State = {
  isLoading: false,
};

// Reducer function
function loadingReducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_LOADING":
      return { isLoading: true };
    case "STOP_LOADING":
      return { isLoading: false };
    default:
      return state;
  }
}

// Contexts
const LoadingStateContext = createContext<State | undefined>(undefined);
const LoadingDispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined,
);

// Provider
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  return (
    <LoadingStateContext.Provider value={state}>
      <LoadingDispatchContext.Provider value={dispatch}>
        {children}
      </LoadingDispatchContext.Provider>
    </LoadingStateContext.Provider>
  );
}

// Hooks
export function useLoadingState() {
  const context = useContext(LoadingStateContext);
  if (context === undefined) {
    throw new Error("useLoadingState must be used within a LoadingProvider");
  }
  return context;
}

export function useLoadingDispatch() {
  const context = useContext(LoadingDispatchContext);
  if (context === undefined) {
    throw new Error("useLoadingDispatch must be used within a LoadingProvider");
  }
  return context;
}
