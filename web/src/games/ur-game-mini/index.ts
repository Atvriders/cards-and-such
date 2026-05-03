import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { UrMiniState, UrMiniAction, UrMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UrMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UrMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const urGameMiniPlugin: GamePlugin<UrMiniState, UrMiniAction, typeof settings> = {
  id: "ur-game-mini",
  title: "Royal Game of Ur (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5000-year-old Sumerian race; compact 14-point track and three pieces.",
  howToPlay: "The Royal Game of Ur is one of the oldest known board games, played in ancient Mesopotamia over five thousand years ago. Players race their pieces around a small course and bear them off. This Mini edition uses a 14-cell linear track with three pieces per side.\n\nYou play one color against a random CPU. The original game used four binary tetrahedral dice; this version substitutes two six-sided dice for simplicity. Click Roll to throw, then click one of your three pieces and choose to advance it by either die or by the combined sum. Each die is used once per turn.\n\nThe board appears as a horizontal track of 15 cells. The final cell is the bear-off zone. Bear off all three of your pieces to win.\n\nThe original Ur board has rosette squares and shared central paths; this Mini abstracts those into pure linear racing. Push your lead piece while keeping others advancing. The CPU plays random legal moves, so consistent play wins reliably. Final score is 100 plus your pip-count lead at the end. A solid result is +15 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UrMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ur-mini-btn", pulses: 3 }; },
  component: UrMiniGame,
};
