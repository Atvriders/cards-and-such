import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeziqueState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Bezique = /* @__PURE__ */ lazy(() => import("./Bezique.js").then((mod) => ({ default: mod.Bezique as unknown as React.ComponentType<unknown> })));
const beziqueSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type BeziqueSettingsType = SettingsOf<typeof beziqueSettings>;

type BeziqueAction = { type: "play"; cardId: string };

export const beziquePlugin: GamePlugin<BeziqueState, BeziqueAction, typeof beziqueSettings> = {
  id: "bezique",
  title: "Bezique",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic French/British 2-player melding and trick-taking game with a 64-card deck.",
  howToPlay: `Bezique is a classic 2-player card game popular in 19th-century France and England. It uses a 64-card double Piquet deck — two copies of 7 through Ace in all four suits.

Each player receives 8 cards. A stock of remaining cards sits face-down. Trump suit is established when either player wins a trick and declares a "marriage" (King and Queen of the same suit in hand) — the marriage suit becomes trump.

During the stock phase, players are not required to follow suit; simply play any card. The winner of each trick draws a replacement from the stock, and the loser draws next. Aces and Tens in tricks score 10 points each.

Special meld — Bezique: Queen of Spades + Jack of Diamonds scores 40 points. A marriage in trump scores 40 points; in a plain suit scores 20 points.

When the stock is exhausted, players must follow suit for the remaining tricks.

The highest score wins. Click a card to play it.`,
  settings: beziqueSettings,
  initialState: (seed: number, settings: BeziqueSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BeziqueState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-bezique-primary"]', pulses: 3 };
  },
  component: Bezique,
};
