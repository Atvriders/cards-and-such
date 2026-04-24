import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Roll Through the Ages (simplified solo).
 * Roll up to 3 dice (cities = more dice, up to 7).
 * Die faces: 2 food, 3 food, 4 food (skull), 5 goods, 6 goods, workers.
 * Collect food (feed cities), goods (buy developments), workers (build monuments).
 * Score by developments and monuments. 5 turns.
 *
 * Simplified: 3 dice, 5 turns. Choose which dice to reroll up to 2x.
 * Goods accumulate; each turn: feed cities (1 food/city, start 3 cities).
 * Developments cost goods. Monuments cost workers.
 */

export interface RollThroughAgesSettings {
  turns: "5" | "7";
}

// Die faces: food1=1,food2=2,skull=3,goods1=4,goods2=5,workers=6
// Mapped: skull = pestilence/disaster for simplicity → lose 3 food
export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

const FACE_LABEL: Record<DieFace, string> = {
  1: "🍖×2",
  2: "🍖×3",
  3: "💀",
  4: "⚙️×1",
  5: "⚙️×2",
  6: "👷×3",
};

export function faceFood(f: DieFace): number { return f === 1 ? 2 : f === 2 ? 3 : 0; }
export function faceGoods(f: DieFace): number { return f === 4 ? 1 : f === 5 ? 2 : 0; }
export function faceWorkers(f: DieFace): number { return f === 6 ? 3 : 0; }
export function faceSkull(f: DieFace): boolean { return f === 3; }

export interface RollThroughAgesState {
  settings: RollThroughAgesSettings;
  rngSeed: number;
  turn: number;
  totalTurns: number;
  cities: number;
  food: number;
  goods: number;
  workers: number;
  monuments: number;
  developments: number;
  currentRoll: DieFace[];
  heldMask: boolean[];
  rerollsLeft: number;
  turnsLeft: number;
  phase: "preRoll" | "rolled" | "turnOver" | "done";
  lastMsg: string;
  score: number;
}

export type RollThroughAgesAction =
  | { type: "roll" }
  | { type: "toggleHold"; index: number }
  | { type: "endRoll" }    // bank this roll
  | { type: "buyDev" }     // spend 3 goods → 1 development (+5 score)
  | { type: "buildMon" }   // spend 6 workers → 1 monument (+10 score)
  | { type: "nextTurn" };

function rollDice(n: number, seed: number): { values: DieFace[]; nextSeed: number } {
  let s = seed >>> 0;
  const values: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    const rng = mulberry32(s);
    const v1 = rng();
    const ns = (Math.floor(v1 * 2 ** 31)) >>> 0;
    const rng2 = mulberry32(s);
    values.push((Math.floor(rng2() * 6) + 1) as DieFace);
    s = ns;
  }
  return { values, nextSeed: s };
}

export function initialState(seed: number, settings: RollThroughAgesSettings): RollThroughAgesState {
  const totalTurns = Number(settings.turns);
  return {
    settings,
    rngSeed: seed >>> 0,
    turn: 1,
    totalTurns,
    cities: 3,
    food: 6,
    goods: 0,
    workers: 0,
    monuments: 0,
    developments: 0,
    currentRoll: [],
    heldMask: [],
    rerollsLeft: 2,
    turnsLeft: totalTurns,
    phase: "preRoll",
    lastMsg: "",
    score: 0,
  };
}

export function reducer(state: RollThroughAgesState, action: RollThroughAgesAction): RollThroughAgesState {
  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolled") return state;
      if (state.phase === "rolled" && state.rerollsLeft <= 0) return state;

      const numDice = state.cities; // 1 die per city, min 3 max 7
      let newRoll: DieFace[];
      let nextSeed = state.rngSeed;

      if (state.phase === "preRoll") {
        const r = rollDice(numDice, state.rngSeed);
        newRoll = r.values;
        nextSeed = r.nextSeed;
        return {
          ...state,
          rngSeed: nextSeed,
          currentRoll: newRoll,
          heldMask: Array(numDice).fill(false) as boolean[],
          rerollsLeft: 2,
          phase: "rolled",
        };
      }

      // Reroll unheld dice
      const { values: fresh, nextSeed: ns } = rollDice(numDice, state.rngSeed);
      nextSeed = ns;
      newRoll = state.currentRoll.map((d, i) => state.heldMask[i] ? d : (fresh[i] ?? d));
      return {
        ...state,
        rngSeed: nextSeed,
        currentRoll: newRoll,
        rerollsLeft: state.rerollsLeft - 1,
        phase: "rolled",
      };
    }

    case "toggleHold": {
      if (state.phase !== "rolled") return state;
      const mask = [...state.heldMask];
      mask[action.index] = !mask[action.index];
      return { ...state, heldMask: mask };
    }

    case "endRoll": {
      if (state.phase !== "rolled") return state;
      // Tally dice
      let food = state.food;
      let goods = state.goods;
      let workers = state.workers;
      let skulls = 0;
      for (const f of state.currentRoll) {
        food += faceFood(f);
        goods += faceGoods(f);
        workers += faceWorkers(f);
        if (faceSkull(f)) skulls++;
      }
      // Skulls: lose 3 food each
      food -= skulls * 3;

      return {
        ...state,
        food,
        goods,
        workers,
        phase: "turnOver",
        lastMsg: skulls > 0 ? `Rolled ${skulls} skull${skulls > 1 ? "s" : ""} — lost ${skulls * 3} food!` : "",
      };
    }

    case "buyDev": {
      if (state.phase !== "turnOver") return state;
      if (state.goods < 3) return state;
      return {
        ...state,
        goods: state.goods - 3,
        developments: state.developments + 1,
        score: state.score + 5,
      };
    }

    case "buildMon": {
      if (state.phase !== "turnOver") return state;
      if (state.workers < 6) return state;
      return {
        ...state,
        workers: state.workers - 6,
        monuments: state.monuments + 1,
        score: state.score + 10,
      };
    }

    case "nextTurn": {
      if (state.phase !== "turnOver") return state;
      // Feed cities: need food = cities
      const foodNeeded = state.cities;
      const shortage = Math.max(0, foodNeeded - state.food);
      const newFood = Math.max(0, state.food - foodNeeded);
      const newScore = state.score - shortage * 2; // -2 per starving city

      const newTurn = state.turn + 1;
      const done = newTurn > state.totalTurns;

      // Gain a city if food surplus >= 5
      const gainCity = newFood >= 5 && state.cities < 7;
      const finalFood = gainCity ? newFood - 5 : newFood;
      const newCities = gainCity ? state.cities + 1 : state.cities;

      return {
        ...state,
        turn: newTurn,
        food: finalFood,
        cities: newCities,
        score: newScore,
        currentRoll: [],
        heldMask: [],
        rerollsLeft: 2,
        phase: done ? "done" : "preRoll",
        lastMsg: shortage > 0
          ? `${shortage} city/cities starved! −${shortage * 2} pts.`
          : gainCity
            ? `Fed all cities. Grew to ${newCities} cities!`
            : "Fed all cities.",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RollThroughAgesState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, state.score) };
}

export { FACE_LABEL };
