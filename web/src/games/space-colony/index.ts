import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpaceColonyState, SpaceColonyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpaceColony } from "./Game.js";

export const spaceColonyPlugin = {
  id: "space-colony",
  title: "Space Colony",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Manage oxygen, food, and energy to keep your space colony alive for 30 days!",
  howToPlay: `Space Colony is a resource management survival game set in deep space. You manage a colony of 10 colonists who need oxygen, food, and energy to survive. Keep them alive through 30 days of hazards and shortages.

Each day you choose one harvest operation: run atmospheric processors to generate oxygen, tend hydroponic gardens for food, or charge solar and nuclear banks for energy. Each harvest restores 30–45 units of the chosen resource.

Daily consumption drains 12 oxygen, 10 food, and 10 energy per day automatically. You can only harvest one resource per day, so you must rotate and anticipate future shortages. Let any resource drop below 10 and your colonists will suffer — dropping to zero kills colonists each day the shortage continues.

After each harvest, a random event may strike. Solar flares drain oxygen. Meteorite impacts destroy food stores. Power surges drain energy. But lucky events exist too: supply ships deliver bonus resources, and efficiency boosts multiply your harvest. Watch the event report carefully each day.

Strategy: Keep all three bars above 25 at all times. Never let two resources drop below 30 simultaneously. Prioritize whichever is lowest. If all three are healthy, top up the one with the lowest reserve headroom. A colony of 10 alive at day 30 with strong resources earns a perfect score. Good luck, commander!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SpaceColonyState, action: SpaceColonyAction) => SpaceColonyState,
  isTerminal,
  component: SpaceColony,
} as unknown as GamePlugin;
