import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type SoccerPenaltyState, type SoccerPenaltyAction } from "./state.js";
import { SoccerPenalty } from "./Game.js";

export const soccerPenaltySettings = {
  kicks: { kind: "enum" as const, label: "Kicks", options: ["5", "10"] as const, default: "5" as const },
} as const;

export const soccerPenaltyPlugin: GamePlugin<SoccerPenaltyState, SoccerPenaltyAction, typeof soccerPenaltySettings> = {
  id: "soccer-penalty",
  title: "Soccer Penalty Kick",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Step up to the spot and beat the keeper. Aim, set your height, and strike!",
  howToPlay: `Soccer Penalty Kick drops you on the penalty spot, 12 yards from goal. You take a series of kicks against an AI goalkeeper who picks a diving direction before each attempt.

You have three controls: Left/Right aim positions your shot horizontally across the goal mouth. Height sets how high the ball travels — low shots are harder to save but a high ball can clear a diving keeper. Power affects whether the shot reaches the goal cleanly; low power combined with extreme height risks ballooning over the bar.

The red keeper marker shows the goalkeeper's position before you shoot. Keepers tend to stay near center but dive left or right. Aim for the opposite corner from where the keeper leans.

Corners and low hard shots are the most reliable. Shooting straight down the middle is high risk — the keeper only has to stand still.

Scoring: goals divided by total kicks, scaled to 1000. A perfect 5/5 scores 1000. Professional penalty takers convert around 75-80% in shoot-outs — can you beat that?

Watch the keeper position indicator carefully — smart placement beats raw power every time.`,
  settings: soccerPenaltySettings,
  initialState,
  reducer,
  isTerminal,
  component: SoccerPenalty,
};
