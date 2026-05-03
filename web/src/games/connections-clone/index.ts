import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ConnectionsState, ConnectionsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WordConnections = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WordConnections as unknown as React.ComponentType<unknown> })));
export const connectionsSettings = {} as const;

export const connectionsPlugin: GamePlugin<ConnectionsState, ConnectionsAction, typeof connectionsSettings> = {
  id: "connections-clone",
  title: "Word Connections",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Group 16 words into 4 secret categories — but watch out for red herrings!",
  howToPlay: `Word Connections presents you with a grid of 16 words. Your goal is to find four groups of four words that share a hidden category.

Tap or click a word to select it. When you have exactly four words selected, press Submit to check. If all four words belong to the same category, the group is revealed and removed from the board with a colored banner showing the category name.

There are four difficulty tiers, color-coded: yellow (easiest), green, blue, and purple (trickiest). Easier groups tend to be straightforward; harder ones involve wordplay, double meanings, or obscure connections.

You are allowed four mistakes total before the game ends. If you are one word away from a correct group, you will see a hint.

Use the Shuffle button at any time to rearrange the grid — sometimes a fresh layout helps you spot patterns.

Score is based on how many groups you solved and how few mistakes you made. Solving all four groups without any mistakes earns the maximum score.

Tips: look for less obvious links — the same word can have multiple meanings, and the puzzle designers often exploit this. Start with the group you feel most confident about.`,
  settings: connectionsSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".conn-btn", pulses: 3 }; },
  component: WordConnections,
};
