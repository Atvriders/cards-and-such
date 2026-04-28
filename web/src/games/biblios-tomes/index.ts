import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BibliosTomesState, BibliosTomesAction, BibliosTomesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BibliosTomesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bibliosTomesPlugin: GamePlugin<BibliosTomesState, BibliosTomesAction, typeof settings> = {
  id: "biblios-tomes",
  title: "Biblios Tomes",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft cards and auction. Monks collect illuminated tomes.",
  howToPlay: "Biblios Tomes is a card-drafting tableau-building game inspired by Biblios. You play a monk gathering illuminated manuscripts of four kinds: golden suns, silver moons, ruby stars, emerald leaves. Each round, three card offers appear; you pick one, then the CPU takes the highest-rank remaining. Eight rounds total. Score by combining suits and ranks: three same-suit earn +10, five same-suit earn another +15, two of same rank earn +5, three of same rank earn +10. Raw ranks sum too. Final score equals tableau total plus +25 bonus if you beat the CPU. Strategy: balance is hard, early rounds let you grab a suit lead, but the CPU's greedy rank-grabbing means high-rank cards rarely make it to you. Aim for low-cost suit-focused cards in early rounds, then high-rank cards once your suit bonuses are locked. Targets: 70-110 with bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BibliosTomesSettings),
  reducer,
  isTerminal,
  component: BibliosTomesGame,
};
