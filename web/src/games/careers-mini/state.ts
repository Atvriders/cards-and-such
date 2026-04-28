import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CareerPath = "business" | "sports" | "hollywood";

export const PATH_LEN = 20;
export const TOTAL_TURNS = 18;

// Each square gives money/fame/happiness. Path-flavored.
type Sq = { m: number; f: number; h: number; label: string };
const business: Sq[] = [
  { m: 50, f: 0, h: 5, label: "Office" },
  { m: 80, f: 5, h: 0, label: "Deal" },
  { m: -20, f: 0, h: 10, label: "Coffee" },
  { m: 100, f: 10, h: 0, label: "IPO Tease" },
  { m: 0, f: 0, h: 15, label: "Mentor" },
  { m: 120, f: 15, h: -5, label: "Big Win" },
  { m: -40, f: 0, h: 20, label: "Vacation" },
  { m: 60, f: 5, h: 0, label: "Bonus" },
  { m: 90, f: 10, h: 0, label: "Promo" },
  { m: -30, f: 0, h: 5, label: "Travel" },
  { m: 50, f: 0, h: 10, label: "Networking" },
  { m: 150, f: 20, h: 0, label: "Acquisition" },
  { m: -20, f: 0, h: 15, label: "Spa" },
  { m: 70, f: 5, h: 0, label: "Quarter" },
  { m: 40, f: 0, h: 10, label: "Lunch" },
  { m: 100, f: 15, h: 0, label: "Board Seat" },
  { m: -50, f: 0, h: 20, label: "Sabbatical" },
  { m: 80, f: 10, h: 0, label: "Stock Sale" },
  { m: 60, f: 5, h: 5, label: "Award" },
  { m: 200, f: 30, h: 10, label: "Tycoon" },
];
const sports: Sq[] = [
  { m: 30, f: 10, h: 0, label: "Practice" },
  { m: 40, f: 15, h: 0, label: "Highlight" },
  { m: 0, f: 5, h: 10, label: "Fan Mail" },
  { m: 60, f: 25, h: 0, label: "Big Game" },
  { m: -20, f: 0, h: 15, label: "Recovery" },
  { m: 50, f: 30, h: 0, label: "MVP Vote" },
  { m: 80, f: 40, h: 0, label: "Endorsement" },
  { m: -10, f: 0, h: 20, label: "Family Time" },
  { m: 70, f: 25, h: 0, label: "Playoff" },
  { m: 40, f: 15, h: 5, label: "Charity" },
  { m: 100, f: 50, h: 0, label: "Championship" },
  { m: -30, f: 0, h: 15, label: "Injury" },
  { m: 60, f: 20, h: 0, label: "All-Star" },
  { m: 30, f: 10, h: 10, label: "Camp" },
  { m: 90, f: 35, h: 0, label: "Trophy" },
  { m: -20, f: 0, h: 20, label: "Off-Season" },
  { m: 50, f: 25, h: 0, label: "Trade" },
  { m: 70, f: 30, h: 5, label: "Magazine Cover" },
  { m: 60, f: 20, h: 5, label: "Exhibition" },
  { m: 150, f: 60, h: 10, label: "Hall of Fame" },
];
const hollywood: Sq[] = [
  { m: 20, f: 20, h: 0, label: "Audition" },
  { m: 40, f: 25, h: 0, label: "Cameo" },
  { m: 0, f: 10, h: 10, label: "Rehearsal" },
  { m: 80, f: 50, h: 0, label: "Lead Role" },
  { m: -10, f: 0, h: 15, label: "Yoga" },
  { m: 60, f: 35, h: 0, label: "Premiere" },
  { m: 100, f: 60, h: 0, label: "Box Office" },
  { m: -20, f: 0, h: 20, label: "Retreat" },
  { m: 50, f: 30, h: 0, label: "Talk Show" },
  { m: 30, f: 20, h: 5, label: "Charity Gala" },
  { m: 80, f: 50, h: 0, label: "Award Show" },
  { m: -30, f: -10, h: 10, label: "Tabloid" },
  { m: 70, f: 40, h: 0, label: "Sequel" },
  { m: 40, f: 25, h: 5, label: "Tour" },
  { m: 90, f: 55, h: 0, label: "Hit Movie" },
  { m: -10, f: 5, h: 15, label: "Memoir" },
  { m: 60, f: 35, h: 0, label: "Series" },
  { m: 70, f: 40, h: 5, label: "Fashion" },
  { m: 50, f: 25, h: 5, label: "Indie" },
  { m: 180, f: 80, h: 10, label: "Oscar" },
];

export const PATHS: Record<CareerPath, Sq[]> = { business, sports, hollywood };

export interface CareersSettings { path: CareerPath; }
export interface CareersState {
  rngSeed: number;
  path: CareerPath;
  pos: number;
  turn: number;
  money: number;
  fame: number;
  happiness: number;
  goalMoney: number;
  goalFame: number;
  goalHappy: number;
  lastRoll: number | null;
  phase: "rolling" | "resolved" | "done";
}
export type CareersAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, settings: CareersSettings): CareersState {
  // Goal totals depend on path: balanced 200 split.
  const goals = { business: { m: 400, f: 60, h: 40 }, sports: { m: 250, f: 200, h: 60 }, hollywood: { m: 300, f: 250, h: 40 } } as const;
  const g = goals[settings.path];
  return {
    rngSeed: seed,
    path: settings.path,
    pos: 0, turn: 1, money: 50, fame: 0, happiness: 50,
    goalMoney: g.m, goalFame: g.f, goalHappy: g.h,
    lastRoll: null, phase: "rolling",
  };
}

export function reducer(state: CareersState, action: CareersAction): CareersState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const roll = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pos = state.pos + roll;
    if (pos >= PATH_LEN) pos = PATH_LEN - 1;
    const sq = PATHS[state.path][pos]!;
    const money = state.money + sq.m;
    const fame = state.fame + sq.f;
    const happiness = state.happiness + sq.h;
    const reachedEnd = pos >= PATH_LEN - 1 || state.turn >= TOTAL_TURNS;
    const goalMet = money >= state.goalMoney && fame >= state.goalFame && happiness >= state.goalHappy;
    const done = reachedEnd || goalMet;
    return { ...state, rngSeed: nextSeed, pos, money, fame, happiness, lastRoll: roll, phase: done ? "done" : "resolved" };
  }
  if (action.type === "next" && state.phase === "resolved") {
    return { ...state, turn: state.turn + 1, phase: "rolling", lastRoll: null };
  }
  return state;
}

export function score(s: CareersState): number {
  // points for hitting goals, plus weighted totals
  const hitM = s.money >= s.goalMoney ? 100 : 0;
  const hitF = s.fame >= s.goalFame ? 100 : 0;
  const hitH = s.happiness >= s.goalHappy ? 100 : 0;
  return Math.max(0, hitM + hitF + hitH + Math.floor(s.money / 4) + s.fame + s.happiness);
}
export function isTerminal(s: CareersState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
