import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FibbageQuizState, FibbageQuizAction, FibbageQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FibbageQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fibbageQuizPlugin: GamePlugin<FibbageQuizState, FibbageQuizAction, typeof settings> = {
  id: "fibbage-quiz",
  title: "Fibbage Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about Fibbage, the bluffing fill-in-the-blank Jackbox party game.",
  howToPlay: "Fibbage Trivia is all about Jackbox Games' most famous bluffing party hit. Players write fake answers to a fill-in-the-blank prompt, then everyone (including you) tries to spot the real one. It's widely regarded as Jackbox's gold standard.\n\nYou'll answer ten multiple-choice questions covering Fibbage's release history (versions 1, 2, 3, and XL), its signature categories like \"Enough About You,\" scoring rules, audience integration, the smartphone-as-controller setup, and the difference between a \"lie\" and a \"truth\" round.\n\nTap A, B, C, or D and press Submit. Each correct answer earns 100 points; wrong answers earn zero and reveal the correct choice.\n\nPress Next between questions and Finish on the last one. Whether you're a Drawful regular or a Quiplash devotee, Fibbage Trivia rewards anyone who's spent a Jackbox-night yelling at a TV. Don't get fooled — and don't fool yourself.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FibbageQuizSettings),
  reducer, isTerminal, component: FibbageQuizGame,
};
