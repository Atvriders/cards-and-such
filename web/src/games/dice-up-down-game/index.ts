import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceUpDownGameState, DiceUpDownGameAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceUpDownGame } from "./DiceUpDownGame.js";
export const diceUpDownGameSettings = { rounds: { kind: "enum" as const, label: "Rounds", options: ["5","10","15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof diceUpDownGameSettings>;
export const diceUpDownGamePlugin: GamePlugin<DiceUpDownGameState, DiceUpDownGameAction, typeof diceUpDownGameSettings> = {
  id: "dice-up-down-game", title: "Dice Up Down", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict whether the next die roll will be higher or lower to build a streak.",
  howToPlay: `Dice Up Down is a streak-building prediction game using a single die. You see the current die value and must predict whether the next roll will be Higher or Lower. Click Higher if you think the next number will be greater, or Lower if you think it will be less. A correct prediction earns 5 points plus a streak bonus of 2 extra points per consecutive correct answer. A wrong guess resets your streak to zero. Play 5, 10, or 15 rounds depending on your settings. Tips: A roll of 1 makes Higher the much safer bet. A roll of 6 means Lower is almost guaranteed. Mid-range values (3 or 4) give roughly even odds either way. Building long streaks is the key to high scores — a 5-guess streak adds 10 bonus points alone.`,
  settings: diceUpDownGameSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-up-down-game-action"]', pulses: 3 }; },
  component: DiceUpDownGame,
};
