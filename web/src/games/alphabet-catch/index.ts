import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AlphabetState, AlphabetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AlphabetCatch = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AlphabetCatch as unknown as React.ComponentType<unknown> })));
export const alphabetCatchSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "15"] as const,
    default: "5" as const,
  },
} as const;

type AlphabetCatchSettings = SettingsOf<typeof alphabetCatchSettings>;

export const alphabetCatchPlugin: GamePlugin<AlphabetState, AlphabetAction, typeof alphabetCatchSettings> = {
  id: "alphabet-catch",
  title: "Alphabet Catch",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A letter falls from the sky — catch it by tapping the matching letter button!",
  howToPlay: `Alphabet Catch is a quick letter-recognition game for young learners. Each round, a large letter drops into view on the screen. Four letter buttons appear below it.

Your task is to tap the button showing the same letter as the one displayed. For example, if you see a big "G" on screen, find the button that also shows "G" and tap it!

Get it right and you earn points. Get it wrong and you score zero for that round. Stay focused — the letters change every round and the choices are always a little tricky, with similar-looking letters mixed in.

You can play 5, 10, or 15 rounds. Your score and round progress are shown at the top. A perfect game means tapping the right letter every single round.

This game helps children learn to recognize uppercase letters quickly. Play a few rounds every day to build letter fluency. Challenge yourself to score 100!`,
  settings: alphabetCatchSettings,
  initialState: (seed: number, settings: AlphabetCatchSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: AlphabetState) => {
    if (state.done) return null;
    return { selector: ".ac-btn", pulses: 3 };
  },
  component: AlphabetCatch,
};
