import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StarTapperState, StarTapperAction, StarTapperSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StarTapperGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const starTapperPlugin: GamePlugin<StarTapperState, StarTapperAction, typeof settings> = {
  id: "star-tapper", title: "Star Tapper", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap shooting stars across the night sky in 30 seconds.",
  howToPlay: `Star Tapper is a 30-second clicker arcade. Twinkling stars appear across the night sky in six lanes; tap them as fast as you can to score 10 points each. Stars linger a few ticks before fading away — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh stars in random lanes. The sky quickly fills with twinkling targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more stars you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those stars and light up the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StarTapperSettings),
  reducer, isTerminal, 
  hint: (state: StarTapperState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".startapper-target", pulses: 3 };
  },
  component: StarTapperGame,
};
