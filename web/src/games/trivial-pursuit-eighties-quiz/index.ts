import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitEightiesQuizState, TrivialPursuitEightiesQuizAction, TrivialPursuitEightiesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrivialPursuitEightiesQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitEightiesQuizPlugin: GamePlugin<TrivialPursuitEightiesQuizState, TrivialPursuitEightiesQuizAction, typeof settings> = {
  id: "trivial-pursuit-eighties-quiz",
  title: "Trivial Pursuit: 1980s",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decade-themed trivia about the 1980s, in classic Trivial Pursuit style.",
  howToPlay: "Trivial Pursuit: 1980s recreates the spirit of Hasbro's beloved decade edition. Each question pulls from the music, films, technology, news, sports, and pop culture that defined the era of neon, MTV, and big hair.\n\nYou face ten multiple-choice questions covering Reagan-era politics, the Cold War, the Walkman, blockbuster movies like E.T. and Back to the Future, the rise of hip-hop, and the consoles that started a console war. Tap A, B, C, or D to choose, then press Submit. Correct earns 100 points; wrong earns zero and reveals the answer.\n\nTrivial Pursuit traditionally rewards broad cultural knowledge over depth, and this format keeps that flavour while compacting it into a single scored solo run. Perfect for warming up before a real game night.\n\nPress Next between questions, Finish on the last. A perfect 1000 makes you a Genus VI champion of the 80s.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrivialPursuitEightiesQuizSettings),
  reducer, isTerminal, component: TrivialPursuitEightiesQuizGame,
};
