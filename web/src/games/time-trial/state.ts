import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TimeTrialSettings {
  gates: "5" | "8";
}

export type GateStatus = "pending" | "hit" | "missed";

export interface Gate {
  position: number;   // 0..9 — horizontal position of the gate
  status: GateStatus;
}

export interface TimeTrialState {
  settings: TimeTrialSettings;
  gates: Gate[];
  currentGate: number;
  carPosition: number;  // 0..9
  score: number;
  penalties: number;
  message: string;
  gameOver: boolean;
  seed: number;
}

export type TimeTrialAction =
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "pass" }
  | { type: "restart" };

function generateGates(rng: () => number, count: number): Gate[] {
  return Array.from({ length: count }, () => ({
    position: Math.floor(rng() * 10),
    status: "pending" as GateStatus,
  }));
}

export function initialState(seed: number, settings: TimeTrialSettings): TimeTrialState {
  const rng = mulberry32(seed);
  const gateCount = parseInt(settings.gates, 10);
  return {
    settings,
    gates: generateGates(rng, gateCount),
    currentGate: 0,
    carPosition: 5,
    score: 0,
    penalties: 0,
    message: "Align with each gate, then press Pass!",
    gameOver: false,
    seed,
  };
}

export function reducer(state: TimeTrialState, action: TimeTrialAction): TimeTrialState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "moveLeft") {
    return { ...state, carPosition: Math.max(0, state.carPosition - 1) };
  }
  if (action.type === "moveRight") {
    return { ...state, carPosition: Math.min(9, state.carPosition + 1) };
  }
  if (action.type === "pass") {
    const gate = state.gates[state.currentGate];
    if (!gate) return state;
    const diff = Math.abs(state.carPosition - gate.position);
    let pts = 0;
    let msg = "";
    let penalty = 0;
    if (diff === 0) { pts = 100; msg = "PERFECT line! +100"; }
    else if (diff === 1) { pts = 60; msg = "Good line! +60"; }
    else if (diff === 2) { pts = 30; msg = "Ok... +30"; }
    else { pts = 0; penalty = 1; msg = "Missed gate! Penalty!"; }

    const newGates = state.gates.map((g, i) =>
      i === state.currentGate ? { ...g, status: (diff <= 2 ? "hit" : "missed") as GateStatus } : g
    );
    const nextGate = state.currentGate + 1;
    const isLast = nextGate >= state.gates.length;

    return {
      ...state,
      gates: newGates,
      currentGate: nextGate,
      score: state.score + pts,
      penalties: state.penalties + penalty,
      message: isLast ? `Race over! Score: ${state.score + pts} with ${state.penalties + penalty} penalties.` : msg,
      gameOver: isLast,
    };
  }
  return state;
}

export function isTerminal(state: TimeTrialState): { score: number } | null {
  if (!state.gameOver) return null;
  const penaltyDeduct = state.penalties * 50;
  return { score: Math.max(0, Math.min(1000, state.score - penaltyDeduct)) };
}
