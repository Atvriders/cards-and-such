import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SockTossState, SockTossAction, SockTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SockToss } from "./Game.js";

const sockTossSettings = {
  tosses: { kind: "enum" as const, label: "Tosses", options: ["6", "10"] as const, default: "6" as const },
} as const;

type SockTossSettingsType = SettingsOf<typeof sockTossSettings>;

export const sockTossPlugin: GamePlugin<SockTossState, SockTossAction, typeof sockTossSettings> = {
  id: "sock-toss",
  title: "Sock Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A sock bounces up and down — release it when it lines up with the basket zone for a perfect toss!",
  howToPlay: `Sock Toss is a vertical timing arcade game. A sock bounces up and down in a narrow lane. A basket zone is highlighted on the lane at a random height. Press TOSS when the sock is level with the basket zone.

A perfectly timed release (sock within the basket zone) scores 100 points. A near miss (slightly off) scores 40 points for a rim shot. Missing the zone entirely scores zero.

The sock bounces at different speeds each round — sometimes slow, sometimes fast. The basket zone also changes position each toss. Watch carefully and time your release precisely.

Use Settings to choose 6 or 10 tosses per game. Maximum score with 6 tosses is 600 points. Can you land every toss in the basket?

It sounds simple — just let go at the right height. But the changing speed and basket position make it trickier than it looks! Practice your timing to achieve a perfect run.`,
  settings: sockTossSettings,
  initialState: (seed: number, settings: SockTossSettingsType) => initialState(seed, settings as SockTossSettings),
  reducer,
  isTerminal,
    hint: (state: SockTossState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-sock-toss-action"]', pulses: 3 };
    },
  component: SockToss,
};
