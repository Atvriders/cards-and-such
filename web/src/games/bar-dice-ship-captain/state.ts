import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;
export const DICE_COUNT = 5;
export const DICE_SIDES = 6;

export interface BarDiceShipCaptainSettings { dummy: boolean; }

export interface BarDiceShipCaptainState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  ship: boolean;
  captain: boolean;
  crew: boolean;
  rolls: number;
}

export type BarDiceShipCaptainAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BarDiceShipCaptainSettings): BarDiceShipCaptainState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    ship: false,
    captain: false,
    crew: false,
    rolls: 0,
  };
}

export function reducer(state: BarDiceShipCaptainState, action: BarDiceShipCaptainAction): BarDiceShipCaptainState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<BarDiceShipCaptainState> = {};
    let ship = state.ship, captain = state.captain, crew = state.crew;
    if (!ship && dice.includes(6)) ship = true;
    if (ship && !captain && dice.includes(5)) captain = true;
    if (ship && captain && !crew && dice.includes(4)) crew = true;
    extra.ship = ship;
    extra.captain = captain;
    extra.crew = crew;
    extra.rolls = state.rolls + 1;
    if (ship && captain && crew) {
      const cargo = dice.filter(d => d !== 6 && d !== 5 && d !== 4).reduce((a,b)=>a+b,0);
      pts = cargo;
      logEntry = `Round complete - cargo ${cargo}`;
    } else {
      logEntry = `Have: ${ship ? "SHIP " : ""}${captain ? "CAPT " : ""}${crew ? "CREW" : ""}`;
    }

    const earlyWin = (false);
    const isLast = state.round >= TOTAL_ROUNDS || earlyWin;
    return {
      ...state, ...extra, rngSeed: nextSeed, dice,
      score: state.score + pts, lastPts: pts,
      history: [...state.history, pts],
      log: [...state.log, logEntry].slice(-12),
      phase: isLast ? "done" : "rolled",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: BarDiceShipCaptainState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
