import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ArcticSurvivalSettings {
  days: "5" | "7" | "10";
}

export type Resource = "food" | "fuel" | "warmth";

export type ArcticEvent =
  | { type: "blizzard" }
  | { type: "supply_cache"; resource: Resource; amount: number }
  | { type: "calm" }
  | { type: "frostbite" };

export interface ArcticSurvivalState {
  settings: ArcticSurvivalSettings;
  rngSeed: number;
  day: number;
  totalDays: number;
  food: number;
  fuel: number;
  warmth: number;
  hp: number;
  log: string[];
  event: ArcticEvent | null;
  phase: "choose" | "event" | "gameover";
  survived: boolean;
  score: number;
}

export type ArcticSurvivalAction =
  | { type: "forage" }
  | { type: "rest" }
  | { type: "gather_fuel" }
  | { type: "restart" };

function genEvent(seed: number, day: number): ArcticEvent {
  const rng = mulberry32(seed + day * 53);
  const r = rng();
  if (r < 0.25) return { type: "blizzard" };
  if (r < 0.45) {
    const res: Resource[] = ["food", "fuel", "warmth"];
    const resource = res[Math.floor(rng() * 3)] as Resource;
    const amount = 2 + Math.floor(rng() * 4);
    return { type: "supply_cache", resource, amount };
  }
  if (r < 0.6) return { type: "frostbite" };
  return { type: "calm" };
}

export function initialState(seed: number, settings: ArcticSurvivalSettings): ArcticSurvivalState {
  const totalDays = parseInt(settings.days, 10);
  return {
    settings,
    rngSeed: seed,
    day: 1,
    totalDays,
    food: 5,
    fuel: 5,
    warmth: 5,
    hp: 10,
    log: ["Day 1: You are stranded in the Arctic. Survive!"],
    event: genEvent(seed, 1),
    phase: "choose",
    survived: false,
    score: 0,
  };
}

export function reducer(state: ArcticSurvivalState, action: ArcticSurvivalAction): ArcticSurvivalState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.phase === "gameover") return state;

  let { food, fuel, warmth, hp, log, day } = state;
  const newLog = [...log];

  if (action.type === "forage") {
    food = Math.min(10, food + 3);
    fuel = Math.max(0, fuel - 1);
    newLog.push("You foraged for food (+3 food, -1 fuel).");
  } else if (action.type === "rest") {
    warmth = Math.min(10, warmth + 2);
    hp = Math.min(10, hp + 1);
    newLog.push("You rested and warmed up (+2 warmth, +1 hp).");
  } else if (action.type === "gather_fuel") {
    fuel = Math.min(10, fuel + 3);
    food = Math.max(0, food - 1);
    newLog.push("You gathered fuel (+3 fuel, -1 food).");
  }

  // Apply event
  const event = state.event;
  if (event) {
    if (event.type === "blizzard") {
      warmth = Math.max(0, warmth - 3);
      fuel = Math.max(0, fuel - 2);
      newLog.push("Blizzard! (-3 warmth, -2 fuel)");
    } else if (event.type === "supply_cache") {
      if (event.resource === "food") food = Math.min(10, food + event.amount);
      if (event.resource === "fuel") fuel = Math.min(10, fuel + event.amount);
      if (event.resource === "warmth") warmth = Math.min(10, warmth + event.amount);
      newLog.push(`Supply cache found! +${event.amount} ${event.resource}`);
    } else if (event.type === "frostbite") {
      hp = Math.max(0, hp - 2);
      newLog.push("Frostbite! (-2 hp)");
    } else {
      newLog.push("A calm day in the Arctic.");
    }
  }

  // Daily consumption
  food = Math.max(0, food - 1);
  fuel = Math.max(0, fuel - 1);
  if (warmth <= 2) hp = Math.max(0, hp - 1);
  if (food === 0) hp = Math.max(0, hp - 1);

  const nextDay = day + 1;
  const dead = hp <= 0;
  const won = !dead && nextDay > state.totalDays;
  const gameOver = dead || won;

  const finalScore = gameOver ? Math.min(100, Math.max(0, hp * 5 + food * 2 + fuel * 2 + warmth)) : 0;

  return {
    ...state,
    day: gameOver ? day : nextDay,
    food,
    fuel,
    warmth,
    hp,
    log: newLog.slice(-6),
    event: gameOver ? null : genEvent(state.rngSeed, nextDay),
    phase: gameOver ? "gameover" : "choose",
    survived: won,
    score: finalScore,
  };
}

export function isTerminal(state: ArcticSurvivalState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
