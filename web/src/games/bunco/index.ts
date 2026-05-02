import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BuncoState, BuncoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bunco } from "./Bunco.js";

export const buncoSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

type BuncoSettingsType = SettingsOf<typeof buncoSettings>;

export const buncoPlugin: GamePlugin<BuncoState, BuncoAction, typeof buncoSettings> = {
  id: "bunco",
  title: "Bunco",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll three dice. Match the round number for points. Hit 21 to end the round.",
  howToPlay: `Bunco is a fast, social dice game played with 3 dice across 6 rounds. Each round has a target number (1 through 6). Roll the dice and score based on how many dice match the round number.

Scoring per roll: each die matching the round number = 1 point. If all 3 dice match the round number, that's a Bunco worth 21 points and the round ends immediately. If all 3 dice show the same face but it doesn't match the round number, score 5 points (3-of-a-kind bonus).

Keep rolling as long as you score. The moment you roll and score 0 points, your turn ends and the round is over. If your accumulated round score reaches 21 or more, the round also ends.

After 6 rounds, your final score is the sum of all 6 round scores. A perfect game requires hitting Bunco (21) in every round.

Tips: you have no decisions to make — just keep rolling while you score. The game is entirely luck-based, but understanding the probabilities helps set expectations. The chance of hitting Bunco (all 3 matching) on any roll is about 1 in 36, so enjoy the streak when it happens!`,
  settings: buncoSettings,
  initialState: (seed: number, settings: BuncoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BuncoState): HintTarget | null => {
    if (state.phase === "gameOver") return null;
    if (state.phase === "roundOver") {
      return { selector: '[data-testid="hint-target-bunco-next-round"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-bunco-roll"]', pulses: 3 };
  },
  component: Bunco,
};
