import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeadsUpState, HeadsUpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HeadsUp = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HeadsUp as unknown as React.ComponentType<unknown> })));
export const headsUpSettings = {
  timeLimit: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["30", "60", "90"] as const,
    default: "60" as const,
  },
  deck: {
    kind: "enum" as const,
    label: "Category",
    options: ["mixed", "celebrities", "animals", "movies", "objects"] as const,
    default: "mixed" as const,
  },
} as const;

type HeadsUpSettingsType = SettingsOf<typeof headsUpSettings>;

export const headsUpPlugin: GamePlugin<HeadsUpState, HeadsUpAction, typeof headsUpSettings> = {
  id: "heads-up",
  title: "Heads Up",
  category: "arcade",
  players: { min: 2, max: 20, multiplayer: false },
  description: "Hold the phone to your forehead — friends describe the word!",
  howToPlay: `Heads Up is a fast and hilarious guessing game. One player holds the device to their forehead (screen facing outward) so they can't see what's on it, but everyone else can.

The screen shows a word or name. The other players must describe, mime, act out, or make sounds to help the person holding the phone guess what it says — without saying the actual word or any part of it.

When the guesser gets it right, they tap Got It! When they're stuck, they tap Skip to move to the next word. The timer counts down — the goal is to guess as many words as possible before time runs out.

Categories include celebrities, animals, movies, everyday objects, or a mixed deck for maximum variety. Choose 30 seconds for a quick fire round, 60 seconds for a standard round, or 90 seconds for a more relaxed pace.

Great for all ages. Works especially well with larger groups where the audience can act out elaborate clues. Score is the total number of words guessed correctly in the time allowed.`,
  settings: headsUpSettings,
  initialState: (seed: number, settings: HeadsUpSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-heads-up-action"]', pulses: 3 }; },
  component: HeadsUp,
};
