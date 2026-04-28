import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;

export interface DiceStormSettings { dummy: boolean; }

export interface DiceStormState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type DiceStormAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Brave","Shelter"];

export function initialState(seed: number, _settings: DiceStormSettings): DiceStormState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: DiceStormState, action: DiceStormAction): DiceStormState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    let display = ""; let points = 0;
    const stormRoll = rng();
    let storm: string; let mult: number;
    if (stormRoll < 0.4) { storm = "☀️"; mult = 1; }
    else if (stormRoll < 0.7) { storm = "🌧"; mult = 2; }
    else if (stormRoll < 0.9) { storm = "⚡"; mult = 3; }
    else { storm = "🌀"; mult = 0; }
    const a = 1 + Math.floor(rng()*6);
    const b = 1 + Math.floor(rng()*6);
    if (choice === "Brave") {
      points = (a + b) * mult;
      display = storm + " 🎲" + a + "+🎲" + b + " ×" + mult;
    } else {
      points = 5;
      display = storm + " sheltered (+5)";
    }
    const win = points > 0;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, score: state.score + points, phase: isLast ? "done" : "result", display, lastChoice: choice, lastWin: win, lastPts: points };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceStormState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
