import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumwordMatchState, NumwordMatchAction, NumwordMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumwordMatchGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const numwordMatchPlugin: GamePlugin<NumwordMatchState, NumwordMatchAction, typeof settings> = {
  id: "numword-match", title: "Numword Match", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match a digit to its English word. 20 rounds.",
  howToPlay: `Numword Match is a quick number-literacy drill. Each round shows a numeric digit (or small whole number), and you pick the matching English word from four choices. Tap the right word, hit Submit, and score 10 points.

The number set covers 0 through 19 individually (zero, one, two, ... nineteen) plus the round multiples of ten (twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety) and the milestone "one hundred." It's the foundational vocabulary every elementary student is expected to master.

Spelling matters — it's "forty" (not "fourty") and "ninety" (not "ninty"). The four answer choices are pulled from this same vocabulary list, so distractors will look familiar; you have to actually read each one rather than picking based on length or initial letter.

There are 20 rounds and no timer — accuracy over speed. Maximum score is 200 points. Easy practice for kids learning their number words, or a quick warm-up for adults who want to flex their lexical-numeric muscles.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NumwordMatchSettings),
  reducer, isTerminal, component: NumwordMatchGame,
};
