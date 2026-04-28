import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WitsWagersQuizState, WitsWagersQuizAction, WitsWagersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WitsWagersQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const witsWagersQuizPlugin: GamePlugin<WitsWagersQuizState, WitsWagersQuizAction, typeof settings> = {
  id: "wits-wagers-quiz",
  title: "Wits and Wagers Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Wits and Wagers, the trivia-with-betting party game.",
  howToPlay: "Wits and Wagers Trivia explores North Star Games' clever twist on trivia where every question has a numerical answer and players bet on whose guess is closest. This version covers the original game, the Family Edition, the Party Edition, and the Vegas Edition.\n\nTen multiple-choice questions test your knowledge of the publisher, designer, betting odds, payouts, the famous dry-erase boards, scoring formula, recommended players, and how Wits and Wagers blends parlour-trivia with casino-style risk.\n\nTap A, B, C, or D and press Submit. Correct earns 100 points; wrong earns zero but reveals the right answer.\n\nUse Next to continue and Finish to wrap up. Even if your trivia is shaky, Wits and Wagers rewards strategic betting on others' guesses — and that meta-skill is what this trivia salutes. Score well to prove you know your bets.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WitsWagersQuizSettings),
  reducer, isTerminal, component: WitsWagersQuizGame,
};
