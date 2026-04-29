import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorTradeRoutesState, SplendorTradeRoutesAction, SplendorTradeRoutesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SplendorTradeRoutesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const splendorTradeRoutesPlugin: GamePlugin<SplendorTradeRoutesState, SplendorTradeRoutesAction, typeof settings> = {
  id: "splendor-trade-routes",
  title: "Splendor: Trade Routes",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Splendor variant adding trade route bonuses.",
  howToPlay: "Splendor: Trade Routes is a Splendor variant where gem cards form trade route corridors. Eight drafting rounds against a CPU opponent.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Suits are trade goods — Spice, Silk, Gold, and Wine.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per trade good with 3+ cards (route established).\n- +15 additional per good with 5+ cards (monopoly).\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Trade Routes rewards monopolizing one good. Three Spice cards is +10 even at low ranks. The greedy CPU takes rank-9, leaving mid-tier cards for your monopoly play. Aim for 60-100 points. Splendor: Trade Routes captures the Renaissance gem-merchant in a faster, draftier flow. Eight rounds; four goods; one trade dynasty.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorTradeRoutesSettings),
  reducer,
  isTerminal,
  component: SplendorTradeRoutesGame,
};
