import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OpenFaceYahtzeeState, OpenFaceYahtzeeAction, OpenFaceYahtzeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OpenFaceYahtzeeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const openFaceYahtzeePlugin: GamePlugin<OpenFaceYahtzeeState, OpenFaceYahtzeeAction, typeof settings> = {
  id: "open-face-yahtzee",
  title: "Open Face Yahtzee",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yahtzee with revealed dice — call the visible category before scoring.",
  howToPlay: "Open Face Yahtzee plays like the classic Yahtzee but with dice visible to all players each turn — no hidden re-rolls. Across 12 rounds five dice are rolled face-up. You read the table and claim one of three category bands: a Straight Run (1-2-3-4-5 or 2-3-4-5-6) pays +40, a Three-Pair-look (any two distinct pairs) pays +25, a Quad (four of a kind or better) pays +50, or you can Bust for zero. The trick is matching the call to the actual roll — Quads are rare but lucrative, Three Pair is common and steady, the Straight is medium-frequency. Wrong category scores zero. Strategy: count dots fast and choose Quad only when you actually see four matching faces. Twelve rounds, top score wins. Open Face is a popular tournament-friendly variant because it removes the bluffing gap between players. Average expected score is around 200.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OpenFaceYahtzeeSettings),
  reducer,
  isTerminal,
  component: OpenFaceYahtzeeGame,
};
