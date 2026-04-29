import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KittyWhistState, KittyWhistAction, KittyWhistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KittyWhistGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kittyWhistPlugin: GamePlugin<KittyWhistState, KittyWhistAction, typeof settings> = {
  id: "kitty-whist", title: "Kitty Whist", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Family Whist variant with a kitty: win tricks against CPU.",
  howToPlay: "Kitty Whist is a family-variant of Whist where extra cards are set aside in a \"kitty\" and one trick is decided by simple comparison. This mini-version simplifies the whole game to ten such trick-comparisons.\n\nEach round (each \"trick\"), you and the CPU each play one card. Higher rank wins. Aces high, twos low. Suit doesn't matter — there's no trump in this mini version.\n\nScoring: trick win awards 10 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen tricks per game. Expected score is around 45-65 points; lucky runs hit 75+.\n\nThe full Kitty Whist includes a kitty pile that the dealer can swap with their hand, plus partnership tricks counted at game's end. This mini bypasses all that — it's pure trick-by-trick, you-vs-CPU. Each round feels like a Whist trick stripped of all the cleverness. Good for warming up before a real Whist game, or for someone who's never tried a trick-game and wants the reflex without the strategy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KittyWhistSettings),
  reducer, isTerminal, component: KittyWhistGame,
};
