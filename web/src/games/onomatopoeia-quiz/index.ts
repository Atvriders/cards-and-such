import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OnomatopoeiaQuizState, OnomatopoeiaQuizAction, OnomatopoeiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OnomatopoeiaQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const onomatopoeiaQuizPlugin: GamePlugin<OnomatopoeiaQuizState, OnomatopoeiaQuizAction, typeof settings> = {
  id: "onomatopoeia-quiz", title: "Onomatopoeia Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the source of onomatopoeic English words.",
  howToPlay: `Onomatopoeia Quiz tests your knowledge of onomatopoeic words — words whose sound mimics what they describe. Each question asks what sound a word imitates or which word matches a sound.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Onomatopoeia brings writing to life: 'buzz', 'crash', 'whoosh', 'crackle'. Comic books, poetry, and children's books rely heavily on these vivid words. Whether you are a writer, comic fan, or word lover, Onomatopoeia Quiz makes language fun and audible. Score points, learn vocabulary, and tune your ear!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OnomatopoeiaQuizSettings),
  reducer, isTerminal, component: OnomatopoeiaQuizGame,
};
