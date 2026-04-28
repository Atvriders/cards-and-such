import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const DICE_COUNT = 5;

export interface BattleYahtzeeSettings { dummy: boolean; }

export interface BattleYahtzeeState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type BattleYahtzeeAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BattleYahtzeeSettings): BattleYahtzeeState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: BattleYahtzeeState, action: BattleYahtzeeAction): BattleYahtzeeState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const counts = [0,0,0,0,0,0,0]; for (const x of d) counts[x] = (counts[x] ?? 0) + 1;
    const max = Math.max(...counts);
    const sum = d.reduce((a,b)=>a+b,0);
    const has3 = counts.indexOf(3) >= 0;
    const has2 = counts.indexOf(2) >= 0;
    const sortedD = [...d].sort((a,b)=>a-b).join(",");
    const smallStraight = ["1,2,3,4","2,3,4,5","3,4,5,6"].some(s => sortedD.includes(s));
    const largeStraight = sortedD === "1,2,3,4,5" || sortedD === "2,3,4,5,6";
    function scoreDice(): number {
      if (max === 5) return 50;
      if (max === 4) return sum;
      if (largeStraight) return 40;
      if (smallStraight) return 30;
      if (has3 && has2) return 25;
      return sum;
    }
    const youScore = scoreDice();
    // CPU dice
    const r2 = mulberry32(seed2);
    const cd = [1+Math.floor(r2()*6),1+Math.floor(r2()*6),1+Math.floor(r2()*6),1+Math.floor(r2()*6),1+Math.floor(r2()*6)];
    const ccounts = [0,0,0,0,0,0,0]; for (const x of cd) ccounts[x] = (ccounts[x] ?? 0) + 1;
    const cmax = Math.max(...ccounts);
    const csum = cd.reduce((a,b)=>a+b,0);
    const chas3 = ccounts.indexOf(3) >= 0;
    const chas2 = ccounts.indexOf(2) >= 0;
    const csorted = [...cd].sort((a,b)=>a-b).join(",");
    const csmall = ["1,2,3,4","2,3,4,5","3,4,5,6"].some(s => csorted.includes(s));
    const clarge = csorted === "1,2,3,4,5" || csorted === "2,3,4,5,6";
    let cpuScore = 0;
    if (cmax === 5) cpuScore = 50;
    else if (cmax === 4) cpuScore = csum;
    else if (clarge) cpuScore = 40;
    else if (csmall) cpuScore = 30;
    else if (chas3 && chas2) cpuScore = 25;
    else cpuScore = csum;
    let pts = 0; let msg = "";
    if (youScore > cpuScore) { pts = 20; msg = "Win " + youScore + " vs " + cpuScore + " +20"; }
    else if (youScore === cpuScore) { pts = 10; msg = "Tie " + youScore + " split +10"; }
    else { pts = 0; msg = "Lost " + youScore + " vs " + cpuScore; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: BattleYahtzeeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
