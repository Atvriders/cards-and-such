import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BalloonBurstState, BalloonBurstAction, BalloonBurstSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BalloonBurst } from "./Game.js";

const balloonBurstSettings = {
  balloons: { kind: "enum" as const, label: "Balloons", options: ["5", "10"] as const, default: "5" as const },
} as const;

type BalloonBurstSettingsType = SettingsOf<typeof balloonBurstSettings>;

export const balloonBurstPlugin: GamePlugin<BalloonBurstState, BalloonBurstAction, typeof balloonBurstSettings> = {
  id: "balloon-burst",
  title: "Balloon Burst",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch the balloon inflate and pop it at the right size. Too big and it bursts for zero points!",
  howToPlay: `Balloon Burst is a timing arcade game. Each round a balloon inflates from tiny to enormous. You must pop it before it bursts on its own.

Click the balloon or press POP when the balloon is the size you want. Popping a large balloon (70%+ full) earns 100 points. A medium balloon (40–70%) earns 60 points. A small balloon earns 20 points. If the balloon bursts before you pop it, you score zero for that round.

The inflation speed varies randomly — sometimes the balloon inflates slowly, giving you more time; other times it inflates very fast and you need to react quickly.

The balloon changes color as it grows: blue means small, orange means medium, red means dangerously large. Pop it in the red zone for maximum points!

Use Settings to choose 5 or 10 balloons. Your final score is the sum of all popped balloons. A perfect game scores 1,000 points. Can you pop every balloon at maximum size?`,
  settings: balloonBurstSettings,
  initialState: (seed: number, settings: BalloonBurstSettingsType) => initialState(seed, settings as BalloonBurstSettings),
  reducer,
  isTerminal,
  component: BalloonBurst,
};
