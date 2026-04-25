import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_MONTHS = 24;

export type Genre = "puzzle" | "rpg" | "shooter" | "platformer" | "sim";
export type Phase = "plan" | "results" | "done";

export interface GameDevState {
  rngSeed: number;
  month: number;
  cash: number;
  phase: Phase;
  genre: Genre;
  teamSize: number;      // 1-8 devs ($200/month each)
  marketingBudget: number; // $0-$300/month
  qualityFocus: boolean;  // spend extra $100/month to boost review scores
  currentProject: string;
  monthsInDev: number;   // months spent on current game
  qualityPoints: number; // accumulated quality toward launch
  gamesReleased: number;
  hype: number;          // 0-100, built by marketing
  lastRelease: { title: string; score: number; sales: number; revenue: number } | null;
  lastCost: number;
  log: readonly string[];
}

export type GameDevAction =
  | { type: "setTeam"; value: number }
  | { type: "setMarketing"; value: number }
  | { type: "setGenre"; value: Genre }
  | { type: "toggleQuality" }
  | { type: "launch" }
  | { type: "devMonth" }
  | { type: "nextMonth" };

export const GENRES: Record<Genre, { label: string; qualityNeeded: number; baseSales: number; pricePerCopy: number }> = {
  puzzle:    { label: "Puzzle",    qualityNeeded: 80,  baseSales: 500,  pricePerCopy: 10 },
  rpg:       { label: "RPG",       qualityNeeded: 150, baseSales: 1200, pricePerCopy: 30 },
  shooter:   { label: "Shooter",   qualityNeeded: 120, baseSales: 1000, pricePerCopy: 20 },
  platformer:{ label: "Platformer",qualityNeeded: 100, baseSales: 800,  pricePerCopy: 15 },
  sim:       { label: "Sim",       qualityNeeded: 130, baseSales: 900,  pricePerCopy: 25 },
};

const GAME_NAMES: Record<Genre, string[]> = {
  puzzle:    ["Brain Blaster", "Cube Crush", "Mind Maze", "Puzzle Quest"],
  rpg:       ["Dragon's Call", "Realm of Echoes", "Shadow Saga", "Crystal Crown"],
  shooter:   ["Bullet Storm", "Hyper Blaze", "Zero Protocol", "Apex Force"],
  platformer:["Jump Quest", "Sky Bouncer", "Pixel Runner", "Nova Jump"],
  sim:       ["City Dreams", "Life Builder", "Farm World", "Cozy Village"],
};

export function initialState(seed: number): GameDevState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    month: 1,
    cash: 500,
    phase: "plan",
    genre: "puzzle",
    teamSize: 2,
    marketingBudget: 50,
    qualityFocus: false,
    currentProject: "Brain Blaster",
    monthsInDev: 0,
    qualityPoints: 0,
    gamesReleased: 0,
    hype: 0,
    lastRelease: null,
    lastCost: 0,
    log: [],
  };
}

export function calcQualityGain(teamSize: number, qualityFocus: boolean, rng: () => number): number {
  const base = teamSize * 10;
  const qBonus = qualityFocus ? 15 : 0;
  const noise = 0.8 + rng() * 0.4;
  return Math.round((base + qBonus) * noise);
}

export function reducer(state: GameDevState, action: GameDevAction): GameDevState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setTeam":
      if (state.phase !== "plan") return state;
      return { ...state, teamSize: Math.max(1, Math.min(8, action.value)) };
    case "setMarketing":
      if (state.phase !== "plan") return state;
      return { ...state, marketingBudget: Math.max(0, Math.min(300, action.value)) };
    case "setGenre":
      if (state.phase !== "plan" || state.monthsInDev > 0) return state;
      return { ...state, genre: action.value };
    case "toggleQuality":
      if (state.phase !== "plan") return state;
      return { ...state, qualityFocus: !state.qualityFocus };

    case "devMonth": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const qualityGain = calcQualityGain(state.teamSize, state.qualityFocus, rng);
      const devCost = state.teamSize * 200 + state.marketingBudget + (state.qualityFocus ? 100 : 0);
      const hypeGain = Math.round((state.marketingBudget / 300) * 20 * (0.8 + rng() * 0.4));
      const newHype = Math.min(100, state.hype + hypeGain);
      const log = `Month ${state.month}: Dev — +${qualityGain} quality (${state.qualityPoints + qualityGain}/${GENRES[state.genre].qualityNeeded}) | Hype: ${newHype}%`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash - devCost,
        qualityPoints: state.qualityPoints + qualityGain,
        monthsInDev: state.monthsInDev + 1,
        hype: newHype,
        lastCost: devCost,
        log: [...state.log, log],
      };
    }

    case "launch": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const info = GENRES[state.genre];
      const qualityRatio = Math.min(1.5, state.qualityPoints / info.qualityNeeded);
      const reviewScore = Math.round(Math.min(100, qualityRatio * 70 + state.hype * 0.3 + rng() * 10));
      const salesMult = (reviewScore / 100) * (1 + state.hype / 100);
      const copies = Math.round(info.baseSales * salesMult * (0.7 + rng() * 0.6));
      const revenue = copies * info.pricePerCopy;
      const devCost = state.teamSize * 200 + state.marketingBudget + (state.qualityFocus ? 100 : 0);

      // Generate new project name
      const names = GAME_NAMES[state.genre];
      const nameIdx = Math.floor(rng() * names.length);
      const newProjectName = names[nameIdx]!;

      const log = `Month ${state.month}: LAUNCHED "${state.currentProject}" — ${reviewScore}/100 score, ${copies} copies → $${revenue}`;
      const release = { title: state.currentProject, score: reviewScore, sales: copies, revenue };
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash - devCost + revenue,
        gamesReleased: state.gamesReleased + 1,
        monthsInDev: 0,
        qualityPoints: 0,
        hype: 0,
        currentProject: newProjectName,
        lastRelease: release,
        lastCost: devCost,
        log: [...state.log, log],
      };
    }

    case "nextMonth": {
      if (state.phase !== "results") return state;
      if (state.month >= TOTAL_MONTHS) return { ...state, phase: "done" };
      return { ...state, month: state.month + 1, phase: "plan" };
    }
  }
}

export function isTerminal(state: GameDevState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 8000) * 100))) };
}
