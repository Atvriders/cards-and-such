import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SetShapesState, SetShapesAction, SetShapesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SetShapesGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const setShapesPlugin: GamePlugin<SetShapesState, SetShapesAction, typeof settings> = {
  id: "set-shapes", title: "SET Shapes", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the SET-valid trio (all same or all different per attribute).",
  howToPlay: "SET Shapes is a digital adaptation of the classic SET card game's signature pattern challenge. Each card has three attributes — color (red, green, purple), shape (circle, square, triangle), and count (one, two, three). A valid SET is any trio where, for each attribute, all three are the same OR all three are different. Each round shows you four candidate trios; exactly one is a valid SET. Pick it, hit Submit, score ten points. Twelve rounds total, maximum 120 points. Beginners struggle with the mental gymnastics — checking three attributes for 'all-same OR all-different' simultaneously is a known logic-skill workout — but veterans of the original SET pick this up in two rounds. Tip: scan attribute-by-attribute (color first, then shape, then count). If any attribute fails the all-same-or-all-different test, that trio is invalid. Try to play without re-reading the rule. Final score reflects pattern-recognition fluency.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SetShapesSettings),
  reducer, isTerminal,
  hint: (state: SetShapesState) => {
    if (state.phase === "done") return null;
    return { selector: ".setshpz-btn.submit, .setshpz-btn.next", pulses: 3 };
  },
  component: SetShapesGame,
};
