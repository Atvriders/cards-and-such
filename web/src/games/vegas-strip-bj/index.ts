import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VegasStripBjState, VegasStripBjAction, VegasStripBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VegasStripBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const vegasStripBjPlugin: GamePlugin<VegasStripBjState, VegasStripBjAction, typeof settings> = {
  id: "vegas-strip-bj", title: "Vegas Strip Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard Vegas Strip rules — dealer stands on soft 17, late surrender allowed.",
  howToPlay: "Vegas Strip Blackjack is the casino-floor standard ruleset. The dealer stands on all seventeens (including soft 17), naturals pay three-to-two, and you may surrender on your first two cards (give up half the bet). Doubling and splitting follow normal Vegas conventions.\n\nEach round you place a one-credit bet and receive two cards; the dealer shows one upcard. You may hit, stand, or surrender. After your decision, the dealer plays out under fixed rules: hit on sixteen, stand on seventeen and over.\n\nTwelve rounds are played. A normal win pays twelve points; a natural blackjack pays eighteen (three-to-two). A tie pushes for six points. A surrender returns six points (half the bet). Standard losses pay zero.\n\nExpected score across twelve rounds is around fifty-five points; a hot run with a couple of naturals can push past eighty. The surrender option gives the player a tiny edge over no-surrender games and is the main reason this variant sits among the best blackjack rules in the casino. Stand on stiff hands when the dealer shows a low upcard.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as VegasStripBjSettings),
  reducer, isTerminal, component: VegasStripBjGame,
};
