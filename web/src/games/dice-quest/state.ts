import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface DiceQuestSettings { dummy: boolean; }

export type Path = "Forest" | "Cave" | "Mountain";

export interface DiceQuestState {
  rngSeed: number;
  round: number;
  hp: number;
  rolls: number[] | null;
  score: number;
  phase: "predict" | "result" | "done";
  log: string;
  lastChoice: Path | null;
  lastWin: boolean;
  lastPts: number;
}

export type DiceQuestAction = { type: "go"; choice: Path } | { type: "next" };

export const CHOICES: readonly Path[] = ["Forest", "Cave", "Mountain"];

export function initialState(seed: number, _settings: DiceQuestSettings): DiceQuestState {
  return { rngSeed: seed, round: 1, hp: 10, rolls: null, score: 0, phase: "predict", log: "", lastChoice: null, lastWin: false, lastPts: 0 };
}

export function reducer(state: DiceQuestState, action: DiceQuestAction): DiceQuestState {
  if (state.phase === "done") return state;
  if (action.type === "go" && state.phase === "predict") {
    const rng = mulberry32(state.rngSeed);
    const nextSeed = (() => { let s = 0; const x = mulberry32(state.rngSeed); for (let i = 0; i < 4; i++) s = Math.floor(x() * 2 ** 31); return s; })();
    let rolls: number[] = []; let pts = 0; let log = ""; let win = false; let dmg = 0;
    if (action.choice === "Forest") {
      const r = 1 + Math.floor(rng() * 6);
      rolls = [r];
      if (r >= 4) { pts = r * 3; win = true; log = `Forest yields fruit (${r}×3).`; }
      else { dmg = 1; log = `Forest snake bites (-1 HP).`; }
    } else if (action.choice === "Cave") {
      const a = 1 + Math.floor(rng() * 6);
      const b = 1 + Math.floor(rng() * 6);
      rolls = [a, b];
      const sum = a + b;
      if (sum >= 9) { pts = 18 + (a === b ? 12 : 0); win = true; log = `Cave: gem (${sum}). +${pts}`; }
      else { dmg = 2; log = `Cave: bat swarm (-2 HP).`; }
    } else {
      const a = 1 + Math.floor(rng() * 6);
      const b = 1 + Math.floor(rng() * 6);
      const c = 1 + Math.floor(rng() * 6);
      rolls = [a, b, c];
      const sum = a + b + c;
      if (sum >= 13) { pts = sum * 2 + 4; win = true; log = `Mountain: vista (sum ${sum}). +${pts}`; }
      else { dmg = 3; log = `Mountain: avalanche (-3 HP).`; }
    }
    const hp = state.hp - dmg;
    const round = state.round + 1;
    let phase: DiceQuestState["phase"] = "result";
    if (round > TOTAL_ROUNDS || hp <= 0) {
      phase = "done";
      if (hp > 0) { return { ...state, rngSeed: nextSeed, hp, rolls, score: state.score + pts + hp * 4, phase, log: log + ` Quest complete (+${hp*4} HP bonus).`, lastChoice: action.choice, lastWin: win, lastPts: pts, round }; }
      return { ...state, rngSeed: nextSeed, hp: 0, rolls, score: state.score + pts, phase, log: log + " Hero collapses.", lastChoice: action.choice, lastWin: win, lastPts: pts, round };
    }
    return { ...state, rngSeed: nextSeed, hp, rolls, score: state.score + pts, phase, log, lastChoice: action.choice, lastWin: win, lastPts: pts, round };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "predict", rolls: null, log: "", lastChoice: null, lastWin: false, lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceQuestState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
