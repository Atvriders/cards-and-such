import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type BasketballFTState, type BasketballFTAction } from "./state.js";
import { BasketballFT } from "./Game.js";

export const basketballFTSettings = {
  shots: { kind: "enum" as const, label: "Shots", options: ["10", "20"] as const, default: "10" as const },
} as const;

export const basketballFTPlugin: GamePlugin<BasketballFTState, BasketballFTAction, typeof basketballFTSettings> = {
  id: "basketball-free-throws",
  title: "Basketball Free Throws",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10 free throws with wind and crowd distractions. Aim and arc the ball through the net.",
  howToPlay: `Basketball Free Throws puts you on the foul line for a session of 10 shots. You must land each shot through the hoop against seeded wind conditions and random crowd distractions.

Before each shot, check the wind indicator (strength and direction) and any active crowd distraction shown above your controls. Wind pushes the ball laterally — compensate by shifting your aim slightly against the wind direction.

Set your Aim angle (center 50% is ideal when wind is calm — adjust for drift) and Arc/Power (72% gives a proper arc). Click Shoot to send the ball up. The physics engine factors in your angle deviation, power deviation from ideal, and wind effect to compute whether the ball clears the front of the rim and drops through.

A history row of green (made) and red (missed) dots shows your session progress. Your final score is based on shooting percentage: 1000 = 100%, 700 = 70%, etc.

Top free-throw shooters in the NBA shoot 90%+. Can you match them? Focus on consistent center aim and steady power — the fundamentals always win. Watch for distractions that try to break your focus!`,
  settings: basketballFTSettings,
  initialState,
  reducer,
  isTerminal,
  component: BasketballFT,
};
