import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 50;

export type Season = "spring" | "summer" | "autumn" | "winter";
export type CropType = "wheat" | "corn" | "tomato" | "potato" | "carrot";

export interface Crop {
  type: CropType;
  turnsPlanted: number; // turns since planting
  grown: boolean;
}

export interface FarmTycoonState {
  rngSeed: number;
  turn: number; // 1..50
  cash: number; // dollars
  season: Season;
  fields: readonly (Crop | null)[]; // 6 fields
  phase: "plant" | "results" | "done";
  lastHarvest: number;
  lastCost: number;
  log: readonly string[];
}

export type FarmTycoonAction =
  | { type: "plantField"; fieldIndex: number; crop: CropType }
  | { type: "harvest" }
  | { type: "nextTurn" };

export const CROPS: Record<CropType, { cost: number; sellPrice: number; growTurns: number; label: string }> = {
  wheat:   { cost: 5,  sellPrice: 12, growTurns: 2, label: "Wheat" },
  corn:    { cost: 8,  sellPrice: 20, growTurns: 3, label: "Corn" },
  tomato:  { cost: 12, sellPrice: 35, growTurns: 4, label: "Tomato" },
  potato:  { cost: 6,  sellPrice: 16, growTurns: 2, label: "Potato" },
  carrot:  { cost: 7,  sellPrice: 18, growTurns: 3, label: "Carrot" },
};

export const SEASON_YIELD: Record<Season, Partial<Record<CropType, number>>> = {
  spring: { wheat: 1.2, corn: 1.0, tomato: 0.8, potato: 1.1, carrot: 1.3 },
  summer: { wheat: 0.9, corn: 1.4, tomato: 1.5, potato: 0.9, carrot: 1.0 },
  autumn: { wheat: 1.1, corn: 1.2, tomato: 0.7, potato: 1.3, carrot: 1.1 },
  winter: { wheat: 0.5, corn: 0.4, tomato: 0.3, potato: 0.7, carrot: 0.6 },
};

function seasonForTurn(turn: number): Season {
  const seasons: Season[] = ["spring", "summer", "autumn", "winter"];
  const idx = Math.floor(((turn - 1) % 20) / 5);
  return seasons[idx % seasons.length]!;
}

export function initialState(seed: number): FarmTycoonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    turn: 1,
    cash: 100,
    season: seasonForTurn(1),
    fields: [null, null, null, null, null, null],
    phase: "plant",
    lastHarvest: 0,
    lastCost: 0,
    log: [],
  };
}

export function reducer(state: FarmTycoonState, action: FarmTycoonAction): FarmTycoonState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "plantField": {
      if (state.phase !== "plant") return state;
      const { fieldIndex, crop } = action;
      if (fieldIndex < 0 || fieldIndex >= 6) return state;
      const existing = state.fields[fieldIndex];
      if (existing && !existing.grown) return state; // already growing
      const cropInfo = CROPS[crop];
      if (state.cash < cropInfo.cost) return state;
      const newFields = [...state.fields] as (Crop | null)[];
      newFields[fieldIndex] = { type: crop, turnsPlanted: 0, grown: false };
      return {
        ...state,
        cash: state.cash - cropInfo.cost,
        fields: newFields,
        lastCost: state.lastCost + cropInfo.cost,
      };
    }

    case "harvest": {
      if (state.phase !== "plant") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      let harvest = 0;
      const newFields = state.fields.map(field => {
        if (!field) return null;
        const cropInfo = CROPS[field.type];
        const newTurns = field.turnsPlanted + 1;
        if (newTurns >= cropInfo.growTurns) {
          const seasonMult: number = SEASON_YIELD[state.season][field.type] ?? 1.0;
          const noise = 0.85 + rng() * 0.3;
          const sale = Math.round(cropInfo.sellPrice * seasonMult * noise);
          harvest += sale;
          return null; // harvested
        }
        return { ...field, turnsPlanted: newTurns };
      });
      const logEntry = `Turn ${state.turn} (${state.season}): Harvested $${harvest}`;
      return {
        ...state,
        rngSeed: nextSeed,
        fields: newFields,
        cash: state.cash + harvest,
        lastHarvest: harvest,
        phase: "results",
        log: [...state.log, logEntry],
      };
    }

    case "nextTurn": {
      if (state.phase !== "results") return state;
      const nextTurn = state.turn + 1;
      if (nextTurn > TOTAL_TURNS) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        turn: nextTurn,
        season: seasonForTurn(nextTurn),
        phase: "plant",
        lastHarvest: 0,
        lastCost: 0,
      };
    }
  }
}

export function isTerminal(state: FarmTycoonState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: 0-100 based on cash, target is $2000
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 2000) * 100))) };
}
