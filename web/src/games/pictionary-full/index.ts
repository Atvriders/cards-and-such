import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryState, PictionaryAction, PictionarySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const PictionaryGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.PictionaryGame as unknown as React.ComponentType<unknown> })),
);

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionaryFullPlugin: GamePlugin<PictionaryState, PictionaryAction, typeof settings> = {
  id: "pictionary-full",
  title: "Pictionary (Full)",
  category: "board",
  players: { min: 2, max: 10, multiplayer: true },
  description: "Hot-seat team drawing race across a board with timed 60-second rounds.",
  howToPlay:
    "Two teams race across a 50-square board. On each team's turn, one player from that team is the drawer: they look at the secret word, pick up the canvas pens, and sketch the word for their teammates to guess in 60 seconds.\n\nWords are drawn from five categories — Person, Object, Action, Animal, and Difficult/All-Play. Each successful guess advances the drawing team three squares; Difficult words are worth five squares. The drawer (or any teammate) may tap 'Got it!' to claim a correct guess, or 'Skip' to pass on a word.\n\nAfter time runs out, control passes to the other team. Drawers may use the pen and the eraser; the canvas clears each new turn. The first team to land on or pass square 50 wins the round; the losing team scores 0. A blowout finish (large square-margin) earns the winning team a bonus.\n\nThis is a hot-seat game — the same browser is used by drawer and guessers. Use the honor system: drawers shouldn't speak the word, and guessers shouldn't peek at the prompt.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as PictionarySettings),
  reducer,
  isTerminal,
  hint: (state: PictionaryState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "setup") return { selector: '[data-testid="pictionary-start"]', pulses: 3 };
    if (state.phase === "drawing") return { selector: '[data-testid="pictionary-correct"]', pulses: 3 };
    if (state.phase === "turnover") return { selector: '[data-testid="pictionary-next-turn"]', pulses: 3 };
    return null;
  },
  component: PictionaryGame,
};
