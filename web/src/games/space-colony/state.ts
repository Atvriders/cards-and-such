import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 30;

export type HarvestAction = "oxygen" | "food" | "energy";

export type ColonyEvent =
  | { kind: "none" }
  | { kind: "solarFlare"; oxygenLoss: number }
  | { kind: "meteorite"; foodLoss: number }
  | { kind: "powerSurge"; energyLoss: number }
  | { kind: "resupply"; resource: HarvestAction; amount: number }
  | { kind: "efficiency"; bonus: number };

export interface SpaceColonyState {
  rngSeed: number;
  day: number;
  oxygen: number;   // 0-100
  food: number;     // 0-100
  energy: number;   // 0-100
  colonists: number; // alive
  phase: "choose" | "event" | "done";
  survived: boolean;
  lastEvent: ColonyEvent;
  lastAction: HarvestAction | null;
  log: readonly string[];
}

export type SpaceColonyAction =
  | { type: "harvest"; resource: HarvestAction }
  | { type: "nextDay" };

function rollEvent(rng: () => number): ColonyEvent {
  const r = rng();
  if (r < 0.12) return { kind: "solarFlare", oxygenLoss: 15 + Math.round(rng() * 15) };
  if (r < 0.22) return { kind: "meteorite", foodLoss: 10 + Math.round(rng() * 20) };
  if (r < 0.30) return { kind: "powerSurge", energyLoss: 15 + Math.round(rng() * 15) };
  if (r < 0.40) {
    const resources: HarvestAction[] = ["oxygen", "food", "energy"];
    const resource: HarvestAction = resources[Math.floor(rng() * 3)] ?? "food";
    return { kind: "resupply", resource, amount: 15 + Math.round(rng() * 20) };
  }
  if (r < 0.50) return { kind: "efficiency", bonus: 10 + Math.round(rng() * 10) };
  return { kind: "none" };
}

export function initialState(seed: number): SpaceColonyState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    oxygen: 70,
    food: 70,
    energy: 70,
    colonists: 10,
    phase: "choose",
    survived: true,
    lastEvent: { kind: "none" },
    lastAction: null,
    log: [],
  };
}

export function reducer(state: SpaceColonyState, action: SpaceColonyAction): SpaceColonyState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "harvest": {
      if (state.phase !== "choose") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const event = rollEvent(rng);

      let oxygen = state.oxygen;
      let food = state.food;
      let energy = state.energy;

      const harvestAmt = 30 + Math.round(rng() * 15);

      // Apply harvest
      switch (action.resource) {
        case "oxygen": oxygen = Math.min(100, oxygen + harvestAmt); break;
        case "food":   food   = Math.min(100, food   + harvestAmt); break;
        case "energy": energy = Math.min(100, energy + harvestAmt); break;
      }

      // Apply event
      switch (event.kind) {
        case "solarFlare":
          oxygen = Math.max(0, oxygen - event.oxygenLoss);
          break;
        case "meteorite":
          food = Math.max(0, food - event.foodLoss);
          break;
        case "powerSurge":
          energy = Math.max(0, energy - event.energyLoss);
          break;
        case "resupply":
          if (event.resource === "oxygen") oxygen = Math.min(100, oxygen + event.amount);
          if (event.resource === "food")   food   = Math.min(100, food   + event.amount);
          if (event.resource === "energy") energy = Math.min(100, energy + event.amount);
          break;
        case "efficiency":
          // Bonus to the harvested resource
          switch (action.resource) {
            case "oxygen": oxygen = Math.min(100, oxygen + event.bonus); break;
            case "food":   food   = Math.min(100, food   + event.bonus); break;
            case "energy": energy = Math.min(100, energy + event.bonus); break;
          }
          break;
        case "none":
          break;
      }

      // Daily consumption
      oxygen = Math.max(0, oxygen - 12);
      food   = Math.max(0, food   - 10);
      energy = Math.max(0, energy - 10);

      // Colonist health effects
      let colonists = state.colonists;
      if (oxygen < 10) colonists = Math.max(0, colonists - 2);
      if (food < 10)   colonists = Math.max(0, colonists - 1);
      if (energy < 10) colonists = Math.max(0, colonists - 1);

      const survived = colonists > 0;
      const logEntry = `Day ${state.day}: harvest ${action.resource} → O₂:${oxygen} 🍱:${food} ⚡:${energy} 👥:${colonists}`;

      if (!survived || state.day >= TOTAL_DAYS) {
        return {
          ...state,
          rngSeed: nextSeed,
          oxygen, food, energy, colonists,
          survived,
          phase: "done",
          lastAction: action.resource,
          lastEvent: event,
          log: [...state.log, logEntry],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        oxygen, food, energy, colonists,
        survived,
        phase: "event",
        lastAction: action.resource,
        lastEvent: event,
        log: [...state.log, logEntry],
      };
    }

    case "nextDay": {
      if (state.phase !== "event") return state;
      return { ...state, day: state.day + 1, phase: "choose" };
    }
  }
}

export function minResource(state: SpaceColonyState): number {
  return Math.min(state.oxygen, state.food, state.energy);
}

export function isTerminal(state: SpaceColonyState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (!state.survived) return { score: Math.round((state.day / TOTAL_DAYS) * 40) };
  // Score based on final colonists and resources
  const resourceScore = Math.round((state.oxygen + state.food + state.energy) / 3);
  const colScore = Math.round((state.colonists / 10) * 40);
  return { score: Math.min(100, resourceScore + colScore) };
}
