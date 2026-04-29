import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AwkwardGuestsState, AwkwardGuestsAction, AwkwardGuestsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AwkwardGuestsGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const awkwardGuestsPlugin: GamePlugin<AwkwardGuestsState, AwkwardGuestsAction, typeof settings> = {
  id: "awkward-guests",
  title: "Awkward Guests",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Murder-clue card deduction quiz.",
  howToPlay: "Awkward Guests adapts the classic deduction puzzle into a focused quiz format. Each round presents a scenario, a set of clues, and four candidate answers. Your task is to apply pure logic to determine which option satisfies every clue simultaneously, then click Submit to lock in your accusation. Score 100 points per correct deduction across ten puzzles for a 1000-point ceiling.\n\nRead the scenario carefully — it tells you the type of mystery (whodunnit, code-cracking, hidden-item, or social-deduction). Then read each clue as a constraint that eliminates options. Cross-reference clues mentally before clicking. The remaining option that violates no clue is your answer. Wrong accusations show the correct answer in green and your selection in red so you can learn the deduction pattern.\n\nTips: when one clue alone narrows the field to one option, you've solved it; otherwise look for an option ruled out by every other answer. Strong deductive players score 800+; perfect 1000 requires reading carefully and not rushing. Use Submit then Next to advance through ten puzzles.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AwkwardGuestsSettings),
  reducer,
  isTerminal,
  component: AwkwardGuestsGame,
};
