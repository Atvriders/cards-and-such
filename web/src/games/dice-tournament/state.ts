import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 3;

export interface DiceTournamentSettings { dummy: boolean; }

export interface DiceTournamentState {
  rngSeed: number;
  round: number;
  rolls: { mine: [number, number]; theirs: [number, number] } | null;
  myWins: number;
  theirWins: number;
  score: number;
  phase: "ready" | "result" | "match-result" | "done";
  log: string;
  needed: number;
}

export type DiceTournamentAction = { type: "play" } | { type: "next" };

export function initialState(seed: number, _settings: DiceTournamentSettings): DiceTournamentState {
  return { rngSeed: seed, round: 1, rolls: null, myWins: 0, theirWins: 0, score: 0, phase: "ready", log: "", needed: 2 };
}

export function reducer(state: DiceTournamentState, action: DiceTournamentAction): DiceTournamentState {
  if (state.phase === "done") return state;
  if (action.type === "play" && (state.phase === "ready" || state.phase === "result")) {
    const rng = mulberry32(state.rngSeed);
    const m1 = 1 + Math.floor(rng()*6);
    const m2 = 1 + Math.floor(rng()*6);
    const t1 = 1 + Math.floor(rng()*6);
    const t2 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const my = m1 + m2;
    const their = t1 + t2;
    let myW = state.myWins;
    let thW = state.theirWins;
    let log = "";
    if (my > their) { myW++; log = `You win the round (${my} vs ${their}).`; }
    else if (their > my) { thW++; log = `Opp wins (${my} vs ${their}).`; }
    else log = `Tie (${my}).`;
    let phase: DiceTournamentState["phase"] = "result";
    let score = state.score + (my > their ? 8 : 0);
    if (myW >= state.needed || thW >= state.needed) {
      phase = "match-result";
      if (myW >= state.needed) {
        score += 30 + state.round * 10;
        log += ` MATCH WON +${30 + state.round * 10}.`;
      } else {
        log += ` Match lost.`;
      }
    }
    return { ...state, rngSeed: nextSeed, rolls: { mine: [m1, m2], theirs: [t1, t2] }, myWins: myW, theirWins: thW, score, phase, log };
  }
  if (action.type === "next") {
    if (state.phase === "result") return { ...state, phase: "ready", rolls: null, log: "" };
    if (state.phase === "match-result") {
      const won = state.myWins >= state.needed;
      if (!won || state.round >= ROUNDS) return { ...state, phase: "done" };
      return { ...state, round: state.round + 1, rolls: null, myWins: 0, theirWins: 0, phase: "ready", log: "" };
    }
  }
  return state;
}

export function isTerminal(state: DiceTournamentState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
