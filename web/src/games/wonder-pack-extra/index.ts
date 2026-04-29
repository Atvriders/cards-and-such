import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WonderPackExtraState, WonderPackExtraAction, WonderPackExtraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WonderPackExtraGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wonderPackExtraPlugin: GamePlugin<WonderPackExtraState, WonderPackExtraAction, typeof settings> = {
  id: "wonder-pack-extra",
  title: "7 Wonders: Wonder Pack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four new wonders extending variety of wonder boards.",
  howToPlay: "7 Wonders: Wonder Pack is a draft of four extra wonder cards spread across eight rounds. Suits are the new wonders — Stonehenge, Manneken Pis, Abu Simbel, and Great Wall.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a wonder progress tableau.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per wonder with 3+ stages built.\n- +15 additional per wonder with 5+ stages built.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Wonder Pack rewards completing a single wonder — three Stonehenge cards is +10. The greedy CPU takes the highest-rank wonder card, leaving mid-tier for your dedicated build. Aim for 60-100 points. 7 Wonders: Wonder Pack expands the seven-civilization race with four new cultural icons. Eight rounds. One wonder rises.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WonderPackExtraSettings),
  reducer,
  isTerminal,
  component: WonderPackExtraGame,
};
