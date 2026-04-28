import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApplesToApplesQuizState, ApplesToApplesQuizAction, ApplesToApplesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApplesToApplesQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const applesToApplesQuizPlugin: GamePlugin<ApplesToApplesQuizState, ApplesToApplesQuizAction, typeof settings> = {
  id: "apples-to-apples-quiz",
  title: "Apples to Apples Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Apples to Apples, the modern party-game classic of subjective comparison.",
  howToPlay: "Apples to Apples Trivia digs into the noun-and-adjective party game that defined a generation of family game nights. Created by Out of the Box and now published by Mattel, Apples to Apples spawned dozens of editions, expansions, and an even more notorious successor.\n\nYou'll answer ten multiple-choice questions covering the game's history, mechanics, judge rules, kid edition differences, the Big Picture variant, common card colours, and the rotating role of the judge each round.\n\nTap one of the four choices labelled A through D and press Submit. Each correct answer earns 100 points. A wrong answer earns zero but reveals the right answer so you can sharpen up.\n\nSome questions test the rules verbatim — for instance, who plays a card in a given turn — while others are about cultural knowledge of the franchise. Press Next to advance and Finish on the final question to see your final tally.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApplesToApplesQuizSettings),
  reducer, isTerminal, component: ApplesToApplesQuizGame,
};
