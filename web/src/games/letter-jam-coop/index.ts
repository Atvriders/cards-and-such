import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LetterJamCoopState, LetterJamCoopAction, LetterJamCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LetterJamCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const letterJamCoopPlugin: GamePlugin<LetterJamCoopState, LetterJamCoopAction, typeof settings> = {
  id: "letter-jam-coop",
  title: "Letter Jam Coop",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative crossword; help deduce hidden words.",
  howToPlay: "Letter Jam Coop is a ten-round cooperative dice tribute to Czech Games Edition's Letter Jam, the cooperative crossword where players help each other deduce hidden words. You and an AI puzzler ally roll dice each round to score letters together. Team target is 70 across 10 rounds. 🔤\n\nEach round both dice are rolled and summed, contributing to your team score. Reach 70 by round 10 and your words are spelled with a +50 cooperative bonus. Per-round averages near 7 mean ten rounds usually clear the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills Letter Jam's cooperative deduction into a compact dice session that rewards teamwork at a glance — perfect for quick replays. The original's clue-passing flair gives way to pure cooperative dice luck here for fast pocket fun.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LetterJamCoopSettings),
  reducer, isTerminal, component: LetterJamCoopGame,
};
