import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HachiHachiState, HachiHachiAction, HachiHachiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HachiHachiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hachiHachiPlugin: GamePlugin<HachiHachiState, HachiHachiAction, typeof settings> = {
  id: "hachi-hachi", title: "Hachi-Hachi", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hanafuda 8-point game: race to score eights.",
  howToPlay: "Hachi-Hachi (八八, \"eight-eight\") is a three-player Hanafuda game where the target score is 88. This mini-version reframes it as an 8-point-per-round dash to a generic high score — a tribute to the eight-themed game.\n\nEach round, you and the CPU each draw one card. Higher rank wins. Aces high (13), twos low (1). Suit is ignored.\n\nScoring: round win awards 8 points (the eponymous eight). Tie awards 3 sympathy points. Loss awards zero.\n\nEight rounds total — eight rounds of eight. Expected score: 35-50 points; lucky runs cross 60.\n\nThe full Hachi-Hachi uses the 48-card Hanafuda deck and complicated bidding-and-yaku scoring among three players. The 88-point target gives the game its name. This mini honors the number eight throughout — eight rounds, eight points per win, eighty-something potential top score. A numerologically pleasing taste of a deeply Japanese game.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HachiHachiSettings),
  reducer, isTerminal,
  hint: (state: HachiHachiState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-hachi-hachi-next"]', pulses: 3 };
  },
  component: HachiHachiGame,
};
