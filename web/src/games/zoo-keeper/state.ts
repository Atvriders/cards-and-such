import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 30;

export interface Animal {
  name: string;
  emoji: string;
  happiness: number; // 0-100
  hunger: number;    // 0-100 (higher = hungrier)
  dirt: number;      // 0-100 (higher = dirtier)
}

export interface ZooState {
  rngSeed: number;
  turn: number;
  animals: readonly Animal[];
  visitors: number;
  totalRevenue: number;
  phase: "action" | "results" | "done";
  lastEvent: string;
  log: readonly string[];
}

export type ZooAction =
  | { type: "feed"; animalIndex: number }
  | { type: "clean"; animalIndex: number }
  | { type: "letVisit" }
  | { type: "endTurn" };

const ANIMAL_DEFS: { name: string; emoji: string }[] = [
  { name: "Lion",    emoji: "🦁" },
  { name: "Penguin", emoji: "🐧" },
  { name: "Giraffe", emoji: "🦒" },
  { name: "Elephant", emoji: "🐘" },
  { name: "Monkey",  emoji: "🐒" },
];

export function initialState(seed: number): ZooState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const animals: Animal[] = ANIMAL_DEFS.map(def => ({
    ...def,
    happiness: 70,
    hunger: 20,
    dirt: 20,
  }));
  return {
    rngSeed: nextSeed,
    turn: 1,
    animals,
    visitors: 0,
    totalRevenue: 0,
    phase: "action",
    lastEvent: "",
    log: [],
  };
}

export function reducer(state: ZooState, action: ZooAction): ZooState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "feed": {
      const { animalIndex } = action;
      if (animalIndex < 0 || animalIndex >= state.animals.length) return state;
      const animals = state.animals.map((a, i) => {
        if (i !== animalIndex) return a;
        const hunger = Math.max(0, a.hunger - 40);
        const happiness = Math.min(100, a.happiness + (a.hunger > 50 ? 10 : 5));
        return { ...a, hunger, happiness };
      });
      return { ...state, animals };
    }

    case "clean": {
      const { animalIndex } = action;
      if (animalIndex < 0 || animalIndex >= state.animals.length) return state;
      const animals = state.animals.map((a, i) => {
        if (i !== animalIndex) return a;
        const dirt = Math.max(0, a.dirt - 50);
        const happiness = Math.min(100, a.happiness + (a.dirt > 60 ? 8 : 4));
        return { ...a, dirt, happiness };
      });
      return { ...state, animals };
    }

    case "letVisit": {
      // Visitors pay based on average happiness
      const avg = state.animals.reduce((sum, a) => sum + a.happiness, 0) / state.animals.length;
      const visitors = Math.round(avg * 0.5);
      const revenue = visitors * 2;
      return {
        ...state,
        visitors: state.visitors + visitors,
        totalRevenue: state.totalRevenue + revenue,
      };
    }

    case "endTurn": {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      // Each animal gets hungrier and dirtier
      const event = rng();
      let eventMsg = "";
      const animals = state.animals.map((a, i) => {
        let hunger = Math.min(100, a.hunger + 15 + Math.round(rng() * 10));
        let dirt = Math.min(100, a.dirt + 10 + Math.round(rng() * 10));
        let happiness = a.happiness;
        // Happiness drops if hungry or dirty
        if (hunger > 70) happiness = Math.max(0, happiness - 10);
        if (dirt > 70) happiness = Math.max(0, happiness - 8);
        happiness = Math.max(0, happiness - 2); // baseline drop
        // Random event
        if (event < 0.15 && i === 0) {
          hunger = Math.min(100, hunger + 20);
          eventMsg = `${a.name} is extra hungry today!`;
        } else if (event < 0.25 && i === 1) {
          happiness = Math.min(100, happiness + 15);
          eventMsg = `Crowd loves the ${a.name}!`;
        }
        return { ...a, hunger, dirt, happiness };
      });
      const nextTurn = state.turn + 1;
      const logLine = `Turn ${state.turn}: avg happiness ${Math.round(state.animals.reduce((s, a) => s + a.happiness, 0) / state.animals.length)}`;
      if (nextTurn > TOTAL_TURNS) {
        return { ...state, rngSeed: nextSeed, turn: nextTurn, animals, phase: "done", lastEvent: eventMsg, log: [...state.log, logLine] };
      }
      return { ...state, rngSeed: nextSeed, turn: nextTurn, animals, phase: "action", lastEvent: eventMsg, log: [...state.log, logLine] };
    }
  }
}

export function avgHappiness(state: ZooState): number {
  return Math.round(state.animals.reduce((s, a) => s + a.happiness, 0) / state.animals.length);
}

export function isTerminal(state: ZooState): { score: number } | null {
  if (state.phase !== "done") return null;
  const avg = avgHappiness(state);
  return { score: Math.max(0, Math.min(100, avg)) };
}
