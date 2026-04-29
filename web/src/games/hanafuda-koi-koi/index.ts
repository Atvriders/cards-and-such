import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanafudaKoiKoiState, HanafudaKoiKoiAction, HanafudaKoiKoiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanafudaKoiKoiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hanafudaKoiKoiPlugin: GamePlugin<HanafudaKoiKoiState, HanafudaKoiKoiAction, typeof settings> = {
  id: "hanafuda-koi-koi", title: "Hanafuda Koi-Koi", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese flower-card capture: high card wins each Koi-Koi round.",
  howToPlay: "Hanafuda Koi-Koi is a classic Japanese capture game played with flower cards (花札). When you make a yaku (scoring combination), you can yell \"Koi-Koi!\" to continue for higher stakes — or lock in your score. This mini-version reduces that to a quick 8-round high-stakes draw.\n\nEach round, you and the CPU each draw one card. Higher rank wins (a \"Koi-Koi!\" win). Aces high (13), twos low (1). Suit doesn't matter — the real Hanafuda has 12 month-suits, but this mini uses standard playing cards for accessibility.\n\nScoring: round win awards 14 points. Tie awards 5 sympathy points. Loss awards zero.\n\nEight rounds total. Expected score: 55-75 points; lucky Koi-Koi runs cross 85.\n\nThe full game uses a 48-card Hanafuda deck with cards depicting flowers, animals, and ribbons across twelve months. The Koi-Koi shout is the signature dramatic moment. This mini-version captures the back-and-forth tension with simple draws. A friendly entry into Japanese card-game culture.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HanafudaKoiKoiSettings),
  reducer, isTerminal, component: HanafudaKoiKoiGame,
};
