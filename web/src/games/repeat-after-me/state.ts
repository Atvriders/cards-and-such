import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type ActionType = "clap" | "stomp" | "snap" | "tap";
export type RepeatPhase = "idle" | "showing" | "input" | "failed" | "complete";

export const ACTIONS: ActionType[] = ["clap", "stomp", "snap", "tap"];

export const ACTION_EMOJI: Record<ActionType, string> = {
  clap: "👏",
  stomp: "🦶",
  snap: "🤌",
  tap: "👆",
};

export const ACTION_LABEL: Record<ActionType, string> = {
  clap: "Clap",
  stomp: "Stomp",
  snap: "Snap",
  tap: "Tap",
};

export interface RepeatAfterMeState {
  phase: RepeatPhase;
  sequence: readonly ActionType[];
  playerIndex: number;
  flashIndex: number;
  activeAction: ActionType | null;
  round: number;
  rngSeed: number;
  rngCounter: number;
}

export type RepeatAfterMeAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "perform"; action: ActionType };

function nextAction(seed: number, counter: number): ActionType {
  const rng = mulberry32(seed + counter * 729137);
  return ACTIONS[Math.floor(rng() * ACTIONS.length)]!;
}

export function initialState(seed: number, _settings: Record<string, never>): RepeatAfterMeState {
  return {
    phase: "idle",
    sequence: [],
    playerIndex: 0,
    flashIndex: -1,
    activeAction: null,
    round: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: RepeatAfterMeState, action: RepeatAfterMeAction): RepeatAfterMeState {
  switch (action.type) {
    case "start": {
      if (state.phase === "idle" || state.phase === "failed" || state.phase === "complete") {
        const newAction = nextAction(state.rngSeed, state.rngCounter);
        const newSequence = [...state.sequence, newAction];
        return {
          ...state,
          phase: "showing",
          sequence: newSequence,
          playerIndex: 0,
          flashIndex: 0,
          activeAction: null,
          round: state.round + 1,
          rngCounter: state.rngCounter + 1,
        };
      }
      return state;
    }
    case "advance-flash": {
      if (state.phase !== "showing") return state;
      const nextFlash = state.flashIndex + 1;
      if (nextFlash >= state.sequence.length) {
        return { ...state, phase: "input", flashIndex: -1, activeAction: null, playerIndex: 0 };
      }
      return { ...state, flashIndex: nextFlash, activeAction: state.sequence[nextFlash]! };
    }
    case "perform": {
      if (state.phase !== "input") return state;
      const expected = state.sequence[state.playerIndex];
      if (action.action !== expected) {
        return { ...state, phase: "failed", activeAction: action.action };
      }
      const newIndex = state.playerIndex + 1;
      if (newIndex >= state.sequence.length) {
        return { ...state, phase: "complete", playerIndex: newIndex, activeAction: action.action };
      }
      return { ...state, playerIndex: newIndex, activeAction: action.action };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RepeatAfterMeState): { score: number } | null {
  if (state.phase === "failed") {
    return { score: Math.max(0, state.round - 1) };
  }
  return null;
}
