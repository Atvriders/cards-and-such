import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersDraftState, SevenWondersDraftAction, SevenWondersDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersDraftPlugin: GamePlugin<SevenWondersDraftState, SevenWondersDraftAction, typeof settings> = {
  id: "seven-wonders-draft",
  title: "Seven Wonders Draft",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft cards over three ages. Build civilization and wonder.",
  howToPlay: "Seven Wonders Draft compresses a three-age civ-builder into eight rounds. Each round you see three cards (representing different civ ages) and pick one. The CPU takes the highest-rank remaining. Cards represent suit categories: sun (military), moon (commerce), star (science), leaf (culture). Across eight rounds you build a tableau of eight cards. Score by combining suits and ranks: three of the same suit earn +10 bonus, five same-suit earn another +15, two of the same rank earn +5, three-of-a-kind earns +10. Raw rank values sum into your score too. Final score equals your tableau plus a +25 bonus if you beat the CPU. Strategy: focus on one or two suits to lock multiple suit bonuses. The CPU greedily takes high-rank cards, so you can sneak suit-focused low-rank cards under their nose. Aim for 70-110 with bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersDraftSettings),
  reducer,
  isTerminal,
  component: SevenWondersDraftGame,
};
