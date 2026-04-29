import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApiaryBeesState, ApiaryBeesAction, ApiaryBeesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApiaryBeesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const apiaryBeesPlugin: GamePlugin<ApiaryBeesState, ApiaryBeesAction, typeof settings> = {
  id: "apiary-bees",
  title: "Apiary: Bees",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bee-civilization card draft; hibernate workers to power up.",
  howToPlay: "Apiary: Bees is a streamlined draft of the bee-civilization game, where eight rounds of card-picking build your hive's tableau across four worker types.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Suits represent worker bees — Drones, Foragers, Guards, and Queens.\n\nScoring per tableau:\n- Sum of bee ranks (1-9 each).\n- +10 per worker type with 3+ bees (hibernation bonus).\n- +15 additional per worker type with 5+ bees.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Apiary's hibernate mechanic translates to set bonuses — three Foragers locks +10 even at low ranks. Drone rank-9 is a tempting solo pick, but the +10 from a third Forager is often greater. The CPU greedily takes the highest rank, so you can deny by snatching mid-rank cards in your committed suit. Aim for 60-100. Apiary: Bees is a peaceful, methodical drafting flow — eight rounds of tactical bee-building.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApiaryBeesSettings),
  reducer,
  isTerminal,
  component: ApiaryBeesGame,
};
