import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TiddlywinksFlickGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "8", "10"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const tiddlywinksFlickPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "tiddlywinks-flick",
  title: "Tiddlywinks Flick",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the best squidger-press for each tiddly.",
  howToPlay: "Tiddlywinks Flick is a multiple-choice puzzle game inspired by the classic Tiddlywinks disc-flicking skill game. Each round shows you a prompt or clue, and you must choose the correct answer from four candidate options.\n\nRead the prompt at the top of the screen carefully. The four answer buttons each show a candidate response, but only one of them satisfies the prompt. Tap the option you believe is correct so it highlights in blue, then press Submit to lock in your guess.\n\nCorrect answers earn 100 points and turn the chosen button green. Wrong answers turn red, while the true answer is always revealed so you can learn from each round. Press Next to advance through the bank of puzzles drawn for your session.\n\nEach prompt shows the wink position and the target cup; pick the best squidger technique among the four options to land the wink. In Settings you can choose how many rounds to play in a single session: 5 for a quick warm-up, 8 for a steady challenge, or 10 for a full sprint through the puzzle bank. Puzzle order is seeded for repeatable runs.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  
  hint: (state: GameState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tiddlywinks-flick-answer-0"]', pulses: 3 } : null,component: TiddlywinksFlickGame,
};
