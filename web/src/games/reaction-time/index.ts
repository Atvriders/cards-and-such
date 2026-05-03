import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReactionTimeState, ReactionTimeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReactionTime } from "./ReactionTime.js";

export const reactionTimeSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "10"] as const,
    default: "5" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type ReactionTimeSettingsType = SettingsOf<typeof reactionTimeSettings>;

export const reactionTimePlugin: GamePlugin<ReactionTimeState, ReactionTimeAction, typeof reactionTimeSettings> = {
  id: "reaction-time",
  title: "Reaction Time",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wait for the green signal, then click as fast as you can. Don't jump the gun!",
  howToPlay: `Test your reflexes! Each round, press Start Round and then wait. The arena will turn red while you wait — do not click yet. After a random delay, it turns green. Click (or tap) as fast as you can when you see green.

Your reaction time for each round is measured in milliseconds from the moment the signal appears to when you click. If you click while the arena is still red (before the signal), that counts as a false start and you receive a 1000ms penalty for that round.

After completing all rounds, your score is calculated from the average reaction time: score = max(0, 1000 − average/2). A 200ms average gives a score of 900. A 400ms average gives 800. False starts dramatically hurt your score because of the large penalty.

Choose how many rounds to play (3, 5, or 10) and the difficulty level. Difficulty affects how long the wait can be before the signal fires — hard makes the maximum delay longer so you cannot predict when it will appear.

Tips: Relax your hand and keep a finger hovering near the button. Anticipating the signal leads to false starts. Instead, let your eyes react rather than trying to predict. Warm up on easy mode to calibrate your reaction time before trying hard.`,
  settings: reactionTimeSettings,
  initialState: (seed: number, settings: ReactionTimeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-reaction-time-action"]', pulses: 3 }; },
  component: ReactionTime,
};
