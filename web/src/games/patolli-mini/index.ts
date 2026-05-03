import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PatolliMiniState, PatolliMiniAction, PatolliMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PatolliMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const patolliMiniPlugin: GamePlugin<PatolliMiniState, PatolliMiniAction, typeof settings> = {
  id: "patolli-mini",
  title: "Patolli (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aztec cross-board race game with bean dice; compact six-pawn track.",
  howToPlay: "Patolli is the ancient Aztec race game played on a cross-shaped board with bean-dice. Players race their stones around the cross and onto the central home. This Mini edition flattens the cross to a 32-cell linear track and gives each player two stones for a brisk session.\n\nYou play one color against a random CPU. Click Roll to throw two six-sided dice (substituting for the bean dice). Click any of your two stones and pick a die value or the combined sum to advance it. Each die is used once per turn.\n\nThe board is shown as a horizontal track of 33 cells. The final cell is the central home. Move both stones there to win.\n\nPatolli is a fast luck-driven race, but pip-management still matters: keep the trailing stone close to the leader so the gap can't be exploited by lucky CPU rolls. The CPU plays random legal moves, so steady play beats it reliably. Final score equals 100 plus your pip-count differential at game end. Aim for +15 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PatolliMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".patollimini-btn", pulses: 3 }; },
  component: PatolliMiniGame,
};
