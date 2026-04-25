import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MarsColonySettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Building {
  type: "habitat" | "mine" | "farm" | "lab";
  level: number;
}

export interface MarsColonyState {
  settings: MarsColonySettings;
  turn: number;
  maxTurns: number;
  oxygen: number;
  food: number;
  minerals: number;
  research: number;
  colonists: number;
  buildings: Building[];
  score: number;
  over: boolean;
  log: string;
}

export type MarsColonyAction =
  | { type: "build"; building: Building["type"] }
  | { type: "end-turn" };

const COSTS: Record<Building["type"], { minerals: number; research: number }> = {
  habitat: { minerals: 4, research: 1 },
  mine:    { minerals: 2, research: 2 },
  farm:    { minerals: 3, research: 1 },
  lab:     { minerals: 2, research: 3 },
};

function difficultyMult(diff: string): number {
  if (diff === "easy") return 1.2;
  if (diff === "hard") return 0.8;
  return 1.0;
}

export function initialState(seed: number, settings: MarsColonySettings): MarsColonyState {
  void mulberry32(seed); // consume seed for future expansion
  return {
    settings,
    turn: 1,
    maxTurns: 15,
    oxygen: 10,
    food: 10,
    minerals: 8,
    research: 3,
    colonists: 5,
    buildings: [],
    score: 0,
    over: false,
    log: "Colony established on Mars. Survive and prosper!",
  };
}

export function reducer(state: MarsColonyState, action: MarsColonyAction): MarsColonyState {
  if (state.over) return state;

  if (action.type === "build") {
    const cost = COSTS[action.building];
    if (state.minerals < cost.minerals || state.research < cost.research) {
      return { ...state, log: `Not enough resources to build ${action.building}!` };
    }
    const buildings = [...state.buildings, { type: action.building, level: 1 }];
    return {
      ...state,
      minerals: state.minerals - cost.minerals,
      research: state.research - cost.research,
      buildings,
      log: `Built a ${action.building}!`,
    };
  }

  if (action.type === "end-turn") {
    const mult = difficultyMult(state.settings.difficulty);
    const habitats = state.buildings.filter(b => b.type === "habitat").length;
    const mines = state.buildings.filter(b => b.type === "mine").length;
    const farms = state.buildings.filter(b => b.type === "farm").length;
    const labs = state.buildings.filter(b => b.type === "lab").length;

    const oxygenProd = Math.round((habitats * 2 + 1) * mult);
    const foodProd = Math.round((farms * 3 + 1) * mult);
    const mineralProd = Math.round((mines * 3 + 1) * mult);
    const researchProd = Math.round((labs * 2 + 1) * mult);

    const oxygenConsume = state.colonists;
    const foodConsume = state.colonists;

    const oxygen = state.oxygen + oxygenProd - oxygenConsume;
    const food = state.food + foodProd - foodConsume;
    const minerals = state.minerals + mineralProd;
    const research = state.research + researchProd;

    // Grow colonists if resources are abundant
    const newColonists = habitats > 0 && oxygen > 5 && food > 5
      ? state.colonists + 1
      : state.colonists;

    const turn = state.turn + 1;
    const died = oxygen <= 0 || food <= 0;
    const finished = turn > state.maxTurns;
    const over = died || finished;
    const score = died
      ? state.colonists * 10
      : Math.round((newColonists * 100 + research * 20 + minerals * 5) * mult);
    const log = died
      ? (oxygen <= 0 ? "Colonists ran out of oxygen!" : "Colonists starved!")
      : finished
      ? `Colony survived ${state.maxTurns} turns!`
      : `Turn ${turn}: O₂ ${Math.round(oxygen)} | Food ${Math.round(food)} | Colonists ${newColonists}`;

    return {
      ...state,
      turn,
      oxygen: Math.max(0, oxygen),
      food: Math.max(0, food),
      minerals,
      research,
      colonists: newColonists,
      score: over ? score : state.score,
      over,
      log,
    };
  }

  return state;
}

export function isTerminal(state: MarsColonyState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
