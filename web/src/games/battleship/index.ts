import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BattleshipState, BattleshipAction, BattleshipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Battleship = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Battleship as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const battleshipPlugin: GamePlugin<BattleshipState, BattleshipAction, typeof settings> = {
  id: "battleship",
  title: "Battleship",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place your fleet, then shoot. Sink all opponent ships to win.",
  howToPlay: `Battleship is a classic naval strategy game played on two 10×10 grids. You have a fleet of 5 ships: Carrier (5 cells), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2). The bot's fleet is placed randomly on the enemy grid, hidden from you.

Setup phase: place your ships by clicking cells on your grid. Use the Rotate button to switch between horizontal and vertical orientation. Each ship is placed in order — a preview shows which ship and orientation is next. Use Auto-Place to randomly position your entire fleet instantly.

Playing phase: click any unrevealed cell on the enemy grid to fire a shot there. A hit is shown with a red X; a miss is shown with a dot. The bot fires back immediately after your shot using a hunt-then-target strategy: it fires randomly until it gets a hit, then probes adjacent cells to finish sinking your ship.

You win by sinking all 5 enemy ships. The bot wins if it sinks all 5 of yours. Ships cannot overlap or extend beyond the grid.

Strategy tip: spread your ships to make them harder to find. When hunting, the bot will focus on adjacent squares after a hit — use that to your advantage by placing ships near edges.`,
  settings,
  initialState: (seed: number, s: BattleshipSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".bs-btn", pulses: 3 }; },
  component: Battleship,
};
