import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RPSState, RPSAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RockPaperScissors } from "./RockPaperScissors.js";

export const rpsSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Best Of",
    options: ["3", "5", "7"] as const,
    default: "5",
  },
  botStyle: {
    kind: "enum" as const,
    label: "Bot Style",
    options: ["random", "pattern"] as const,
    default: "pattern",
  },
} as const;

type RPSSettingsType = SettingsOf<typeof rpsSettings>;

export const rockPaperScissorsPlugin: GamePlugin<RPSState, RPSAction, typeof rpsSettings> = {
  id: "rock-paper-scissors",
  title: "Rock Paper Scissors",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Best-of-N match against a pattern-reading bot.",
  howToPlay: `Rock Paper Scissors is a best-of-N match against a bot. Each round you and the bot secretly pick Rock, Paper, or Scissors simultaneously. Rock beats Scissors, Scissors beats Paper, and Paper beats Rock. If both pick the same, the round is a draw.

Click one of the three emoji buttons to reveal your choice. The bot responds immediately and the round result is shown. First to win the majority of rounds wins the match (e.g., first to 2 wins in Best of 3, or first to 3 wins in Best of 5).

Bot Styles: "random" picks uniformly at random each round — no pattern. "pattern" watches your last three picks and tries to counter your most frequent choice, so varying your picks is the best counter-strategy.

Settings: Best Of 3 / 5 / 7 changes match length. Bot Style changes AI behaviour.

Scoring: winning the match scores 100 plus 20 per round won. A drawn match scores 50. A loss scores 0.

Tips: against the pattern bot, avoid repeating the same throw twice in a row. Mix in deliberate counter-traps: if the bot expects rock from you and picks paper, surprise it with scissors.`,
  settings: rpsSettings,
  initialState: (seed: number, settings: RPSSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-rock-paper-scissors-action"]', pulses: 3 }; },
  component: RockPaperScissors,
};
