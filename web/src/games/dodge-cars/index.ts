import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DodgeCarsState, DodgeCarsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DodgeCars } from "./DodgeCars.js";

export const dodgeCarsSettings = {
  lanes: {
    kind: "enum" as const,
    label: "Lanes",
    options: ["3", "4", "5"] as const,
    default: "3" as const,
  },
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type DodgeCarsSettingsType = SettingsOf<typeof dodgeCarsSettings>;

export const dodgeCarsPlugin: GamePlugin<DodgeCarsState, DodgeCarsAction, typeof dodgeCarsSettings> = {
  id: "dodge-cars",
  title: "Dodge Cars",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Weave through oncoming traffic for as long as possible without crashing.",
  howToPlay: `You are driving a car on a multi-lane road. Enemy cars barrel toward you from the top of the screen. Switch lanes to dodge them — if any car hits you, the run ends.

Press the Left or Right arrow key (or A/D) to change lanes instantly. On mobile, tap the on-screen left and right buttons. You cannot move outside the outermost lanes.

Your score is based on how long you survive. Traffic gets faster and more frequent as time goes on, so the longer you last, the harder it becomes. Stay calm and read the incoming lanes carefully — it is often safer to stay in your current lane than to swerve into one that is about to be blocked.

Choose from 3, 4, or 5 lanes. More lanes give you more room to maneuver but also more potential traffic. Three speed settings control how fast oncoming cars approach: Slow is forgiving; Medium is the standard challenge; Fast is for expert drivers who can react instantly.

Tips: Look ahead at cars just entering the top of the screen rather than reacting to those already close. Most crashes happen from last-second panic moves, not from cars that were always in your lane. Pick a side early and commit to it.`,
  settings: dodgeCarsSettings,
  initialState: (seed: number, settings: DodgeCarsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-dodge-cars-action"]', pulses: 3 }; },
  component: DodgeCars,
};
