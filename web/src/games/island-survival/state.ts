import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 20;

export type SurvivalAction = "food" | "water" | "shelter" | "signal";

export type RandomEvent =
  | { kind: "none" }
  | { kind: "storm"; severity: number }
  | { kind: "rescue" }
  | { kind: "rain" }
  | { kind: "bounty" };

export interface IslandState {
  rngSeed: number;
  day: number;      // 1..20
  food: number;     // 0-100
  water: number;    // 0-100
  shelter: number;  // 0-100
  health: number;   // 0-100
  survived: boolean;
  rescued: boolean;
  phase: "choose" | "event" | "done";
  lastAction: SurvivalAction | null;
  lastEvent: RandomEvent;
  log: readonly string[];
}

export type IslandAction =
  | { type: "choose"; action: SurvivalAction }
  | { type: "nextDay" };

function rollEvent(rng: () => number): RandomEvent {
  const r = rng();
  if (r < 0.08) return { kind: "rescue" };
  if (r < 0.2)  return { kind: "storm", severity: 1 + Math.floor(rng() * 3) };
  if (r < 0.35) return { kind: "rain" };
  if (r < 0.45) return { kind: "bounty" };
  return { kind: "none" };
}

export function initialState(seed: number): IslandState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    food: 60,
    water: 60,
    shelter: 30,
    health: 100,
    survived: true,
    rescued: false,
    phase: "choose",
    lastAction: null,
    lastEvent: { kind: "none" },
    log: [],
  };
}

export function reducer(state: IslandState, action: IslandAction): IslandState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "choose": {
      if (state.phase !== "choose") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const event = rollEvent(rng);

      let food = state.food;
      let water = state.water;
      let shelter = state.shelter;
      let health = state.health;
      let rescued = state.rescued;

      // Apply chosen action
      switch (action.action) {
        case "food":    food = Math.min(100, food + 30 + Math.round(rng() * 20));   break;
        case "water":   water = Math.min(100, water + 35 + Math.round(rng() * 15)); break;
        case "shelter": shelter = Math.min(100, shelter + 25);                       break;
        case "signal":  /* signal fire — bonus on rescue event */ break;
      }

      // Apply event
      let eventDesc = "";
      switch (event.kind) {
        case "rescue":
          rescued = true;
          eventDesc = "🚁 Rescue helicopter spotted! You signal frantically!";
          if (action.action === "signal") {
            eventDesc = "🚁 RESCUED! Your signal fire caught their attention!";
          }
          break;
        case "storm":
          shelter = Math.max(0, shelter - 20 * event.severity);
          health = Math.max(0, health - 10 * event.severity + Math.round(shelter / 10));
          eventDesc = `🌪️ Storm (severity ${event.severity}) hits! Shelter took damage.`;
          break;
        case "rain":
          water = Math.min(100, water + 25);
          eventDesc = "🌧️ Rain collected extra water!";
          break;
        case "bounty":
          food = Math.min(100, food + 20);
          eventDesc = "🌴 Found coconuts! Extra food.";
          break;
        case "none":
          eventDesc = "";
          break;
      }

      // Daily consumption
      food = Math.max(0, food - 15);
      water = Math.max(0, water - 20);

      // Health effects
      if (food === 0) health = Math.max(0, health - 15);
      if (water === 0) health = Math.max(0, health - 20);
      if (shelter < 20) health = Math.max(0, health - 5);
      health = Math.min(100, health + (food > 50 && water > 50 ? 3 : 0));

      const survived = health > 0;
      const logLine = `Day ${state.day}: ${action.action} → food ${food} water ${water} shelter ${shelter} health ${health}${eventDesc ? ". " + eventDesc : ""}`;

      if (!survived || rescued || state.day >= TOTAL_DAYS) {
        return {
          ...state,
          rngSeed: nextSeed,
          food, water, shelter, health,
          survived,
          rescued,
          phase: "done",
          lastAction: action.action,
          lastEvent: event,
          log: [...state.log, logLine],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        food, water, shelter, health,
        rescued,
        phase: "event",
        lastAction: action.action,
        lastEvent: event,
        log: [...state.log, logLine],
      };
    }

    case "nextDay": {
      if (state.phase !== "event") return state;
      return { ...state, day: state.day + 1, phase: "choose" };
    }
  }
}

export function isTerminal(state: IslandState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (!state.survived) return { score: Math.round((state.day / TOTAL_DAYS) * 40) };
  if (state.rescued) return { score: 100 };
  // Survived all 20 days
  const avgResources = (state.food + state.water + state.health) / 3;
  return { score: Math.max(60, Math.round(avgResources)) };
}
