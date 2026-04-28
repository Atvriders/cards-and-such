import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PursuitState, PursuitAction, PursuitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PursuitMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pursuitMiniPlugin: GamePlugin<PursuitState, PursuitAction, typeof settings> = {
  id: "pursuit-mini",
  title: "Pursuit Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll, advance, and answer true/false life-wisdom questions on a 50-square wisdom path.",
  howToPlay: `Pursuit Mini is a single-player wisdom race inspired by trivia-style board games. The board is a single 50-square path, and your goal is to fill your wisdom meter as you walk it.

How to play:
1. Press Roll to roll a six-sided die. Your token advances 1-6 squares along the path. The roll is seeded so it is reproducible per game.
2. After the roll, a true/false life-skill question appears — about saving, sleep, gratitude, learning, exercise, and other practical wisdom topics.
3. Pick True or False. Each correct answer awards +10 wisdom. Wrong answers cost nothing in wisdom but you still advance.
4. Press Next to take another turn.

The game ends when your token reaches square 50. Average rolls of 3.5 mean you usually take 14-15 questions before the run ends — so a perfect run is roughly 140-150 wisdom. Below 60 means it was a tough quiz; above 100 is solid.

There is no fail state — the game always finishes. Aim to think before answering. Most questions are common-sense practical philosophy rather than trick questions.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PursuitSettings),
  reducer,
  isTerminal,
  component: PursuitMiniGame,
};
