import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeatThatState, BeatThatAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BeatThat } from "./BeatThat.js";

export const beatThatSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "10"] as const,
    default: "5" as const,
  },
  dice: {
    kind: "enum" as const,
    label: "Dice",
    options: ["2", "3", "4"] as const,
    default: "2" as const,
  },
} as const;

type BeatThatSettingsType = SettingsOf<typeof beatThatSettings>;

export const beatThatPlugin: GamePlugin<BeatThatState, BeatThatAction, typeof beatThatSettings> = {
  id: "beat-that",
  title: "Beat That!",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice and arrange them into the highest number — beat the bot to win!",
  howToPlay: `Beat That! is a quick dice-arrangement game played over 3, 5, or 10 rounds. Each round you roll a set of dice (2, 3, or 4) and must arrange them into the largest possible number. With 2 dice showing 4 and 6, you choose 64 or 46 — obviously 64 is the play!

Click dice to place them into your number, left to right. Click a placed die to remove it and return it to the pool. When all dice are placed, click Submit to lock in your number. The bot then rolls its own dice and automatically arranges them optimally (descending sort).

Compare: higher number wins the round. Player with the most round wins at the end takes the match. Ties on a round do not award a point to either player.

Scoring: winning earns 100 points per round win; a draw earns 50 points per win.

Strategy: the optimal play is almost always to place your highest digits first. The tricky part is that with 3 or 4 dice, the bot is unbeatable if it rolls high — so your only edge is choosing to play with the same number of dice it uses and hoping you roll higher.`,
  settings: beatThatSettings,
  initialState: (seed: number, settings: BeatThatSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-beat-that-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-beat-that-roll"]', pulses: 3 };
  },
  component: BeatThat,
};
