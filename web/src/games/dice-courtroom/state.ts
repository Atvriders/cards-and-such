import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 8;

export interface DiceCourtroomSettings { dummy: boolean; }

export type Move = "evidence" | "objection" | "speech";

export interface DiceCourtroomState {
  rngSeed: number;
  round: number;
  myEvidence: number;
  oppEvidence: number;
  rolls: { mine: [number, number]; opp: [number, number] } | null;
  score: number;
  phase: "choose" | "result" | "done";
  log: string;
}

export type DiceCourtroomAction = { type: "play"; move: Move } | { type: "next" };

export function initialState(seed: number, _settings: DiceCourtroomSettings): DiceCourtroomState {
  return { rngSeed: seed, round: 1, myEvidence: 0, oppEvidence: 0, rolls: null, score: 0, phase: "choose", log: "" };
}

export function reducer(state: DiceCourtroomState, action: DiceCourtroomAction): DiceCourtroomState {
  if (state.phase === "done") return state;
  if (action.type === "play" && state.phase === "choose") {
    const rng = mulberry32(state.rngSeed);
    const m1 = 1 + Math.floor(rng()*6);
    const m2 = 1 + Math.floor(rng()*6);
    const o1 = 1 + Math.floor(rng()*6);
    const o2 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const myRoll = m1 + m2;
    const oppRoll = o1 + o2;
    let pts = 0;
    let myEv = state.myEvidence;
    let oppEv = state.oppEvidence;
    let log = "";
    if (action.move === "evidence") {
      myEv += myRoll;
      pts = myRoll;
      log = `Evidence presented (+${myRoll}). Opponent counters ${oppRoll}.`;
      oppEv += oppRoll;
    } else if (action.move === "objection") {
      if (myRoll > oppRoll) {
        oppEv = Math.max(0, oppEv - myRoll);
        pts = 6;
        log = `Objection sustained! Opp evidence -${myRoll}. +6.`;
      } else {
        pts = -2;
        log = `Objection overruled. -2.`;
      }
    } else {
      // speech
      pts = m1 === m2 ? myRoll * 3 : myRoll;
      log = `Speech ${pts > myRoll ? "(matched dice — bonus!)" : ""} +${pts}.`;
      myEv += Math.floor(myRoll / 2);
      oppEv += oppRoll;
    }
    const round = state.round + 1;
    let score = state.score + pts;
    let phase: DiceCourtroomState["phase"] = "result";
    if (round > ROUNDS) {
      phase = "done";
      const verdict = myEv >= oppEv ? 50 : -10;
      score += verdict;
      log += verdict > 0 ? ` VERDICT WON +50.` : ` Lost the case -10.`;
    }
    return { ...state, rngSeed: nextSeed, round, myEvidence: myEv, oppEvidence: oppEv, rolls: { mine: [m1, m2], opp: [o1, o2] }, score, phase, log };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "choose", rolls: null, log: "" };
  }
  return state;
}

export function isTerminal(state: DiceCourtroomState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
