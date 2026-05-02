import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiddlerState, DiddlerAction, DiddlerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiddlerGame } from "./Game.js";

export const diddlerSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const diddlerPlugin: GamePlugin<DiddlerState, DiddlerAction, typeof diddlerSettings> = {
  id: "diddler",
  title: "Diddler",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3 dice and arrange them into the highest 3-digit number — best of 5 rounds wins.",
  howToPlay: `Diddler is a quick two-player dice game played in rounds. You compete against a bot. The match is won by the first player to win 5 rounds.

At the start of each round, click Roll Dice. Both you and the bot receive three six-sided dice, rolled simultaneously. Your job is to arrange your three dice into a 3-digit number — you decide the order. The bot always arranges its dice to form the highest possible number.

To set your number, click one of your dice to select it (it highlights), then click one of the three digit slots to place it there. Repeat for all three dice. You can click a die already in a slot to remove it and reassign it. When all three slots are filled, click Confirm Number to lock in your answer.

The player with the higher 3-digit number wins the round. For example, if you rolled 3, 5, 2, you might arrange them as 532 — much better than 235! Think carefully. On a tie, no round point is awarded.

After the round result is shown, click Next Round to continue. First to 5 round wins takes the match. Good luck out-arranging the bot!`,
  settings: diddlerSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-diddler-roll"]', pulses: 3 };
  },
  component: DiddlerGame,
};
