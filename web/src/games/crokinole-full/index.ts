import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import {
  initialState,
  reducer,
  isTerminal,
  type CrokinoleState,
  type CrokinoleAction,
} from "./state.js";

const CrokinoleFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.CrokinoleFullGame as unknown as React.ComponentType<unknown>,
  })),
);

export const crokinoleFullSettings = {
  discsPerPlayer: {
    kind: "enum" as const,
    label: "Discs per player",
    options: ["6", "12"] as const,
    default: "12" as const,
  },
  target: {
    kind: "enum" as const,
    label: "Match target",
    options: ["60", "100"] as const,
    default: "100" as const,
  },
} as const;

export const crokinoleFullPlugin: GamePlugin<
  CrokinoleState,
  CrokinoleAction,
  typeof crokinoleFullSettings
> = {
  id: "crokinole-full",
  title: "Crokinole (Full Tournament)",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Flick discs from the rim into the center hole; knock out opponents along the way.",
  howToPlay: `Crokinole is a flicking dexterity board. Each player has a stack of discs and takes alternating shots from the rim of the circular board. Score by landing your discs in scoring rings — outer (5), middle (10), inner (15), or the center 20-hole.

Aim: click and hold on any of your discs at the rim, drag back to set direction and power, and release to flick. A long drag = a stronger shot; the angle from your starting click to your release point sets the line.

The "touch opponent" rule: if your opponent has any disc on the board when it's your turn, your shot must touch one of theirs. If it doesn't, your disc is removed from the board regardless of where it lands.

Hazards: eight pegs are arranged around the 15-point ring. Discs deflect off pegs and off other discs. Anything that crosses the outer rim is removed.

Scoring a round: at round end, each player tallies their own discs in scoring rings (or 20 per disc in the hole). The lower gross subtracts from the higher gross — the player with more in scoring zones wins those net points for the round. First player to the match target (60 or 100) wins.

Click and drag on any of your discs at the rim (or on the rim itself) — pull back like a slingshot. Release to fire. The CPU automatically takes its turn after you.`,
  settings: crokinoleFullSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s) => {
    if (s.phase === "done") return null;
    if (s.phase === "sim") return null;
    if (s.phase === "round-end")
      return { selector: '[data-testid="crokinole-full-next-round"]', pulses: 3 };
    return { selector: '[data-testid="crokinole-full-board"]', pulses: 3 };
  },
  component: CrokinoleFullGame,
};
