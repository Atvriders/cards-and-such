import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReverseCharadesQuizState, ReverseCharadesQuizAction, ReverseCharadesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReverseCharadesQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const reverseCharadesQuizPlugin: GamePlugin<ReverseCharadesQuizState, ReverseCharadesQuizAction, typeof settings> = {
  id: "reverse-charades-quiz",
  title: "Reverse Charades Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of Reverse Charades, the team-acts-one-guesses party twist.",
  howToPlay: "Reverse Charades Trivia covers the high-energy charades variant where the team acts in unison while a single player guesses. Ten questions explore the rules, the publisher, the categories on the cards, and the subtle ways the role-reversal changes party dynamics.\n\nEach multiple-choice question gives four options. Pick A, B, C, or D and press Submit. Correct answers add 100 points to your score; wrong answers earn zero but show you the right answer for future games.\n\nQuestion topics include the timer mechanics, what the guesser is allowed to do, ideal player counts, the publishing studio, and how Reverse Charades differs from classic charades. You'll also encounter subtle rules about miming categories and team-coordination challenges.\n\nUse Next to advance between questions and Finish on the last one. A perfect run earns 1000 points and crowns you the household charades-historian. Ready, set, mime!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ReverseCharadesQuizSettings),
  reducer, isTerminal, component: ReverseCharadesQuizGame,
};
