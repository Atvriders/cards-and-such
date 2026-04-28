import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FairyTaleDraftState, FairyTaleDraftAction, FairyTaleDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FairyTaleDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fairyTaleDraftPlugin: GamePlugin<FairyTaleDraftState, FairyTaleDraftAction, typeof settings> = {
  id: "fairy-tale-draft",
  title: "Fairy Tale Draft",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese card draft with conditional freezing. Magical fae across rounds.",
  howToPlay: "Fairy Tale Draft is a card-drafting tableau-builder inspired by the Japanese Fairy Tale game. Each round, three offers appear and you pick one; the CPU takes the highest-rank remaining. Eight rounds total. Cards represent four magical realms: sun (gold), moon (mist), star (storm), leaf (forest). Score by combining suits and ranks: three same-realm earn +10, five same-realm earn another +15, pairs of same rank earn +5, triples earn +10. Raw rank values sum too. Final score equals tableau plus +25 bonus if you beat the CPU. Strategy: the original game has 'freezing' conditions that lock cards into a particular pattern. Here, focus on a single realm early, then mix in high-rank pairs once your suit bonus is locked. The CPU greedily takes high-rank cards, leaving you with suit-focused lower-rank ones, exactly what you want. Aim for 70-110 with bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FairyTaleDraftSettings),
  reducer,
  isTerminal,
  component: FairyTaleDraftGame,
};
