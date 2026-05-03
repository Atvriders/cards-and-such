import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SorryClState, SorryClAction, SorryClSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SorryClGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sorryClassicPlugin: GamePlugin<SorryClState, SorryClAction, typeof settings> = {
  id: "sorry-classic",
  title: "Sorry! (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pachisi derivative; race four pawns around the track to home.",
  howToPlay: "Sorry! is the classic American Pachisi-derivative where movement is normally driven by cards rather than dice. This simplified single-player edition uses two dice in place of cards while preserving the race structure: get all four of your pawns around the 40-cell track and into your home base.\n\nYou play one color (red) against a random CPU. Click Roll to throw the two dice. Click any of your four pawns and advance it by either die value or by the combined sum. Each die may be used once per turn.\n\nThe board is rendered as a horizontal 41-cell track. The last cell is your home. Move all four pawns into home to win.\n\nClassic Sorry! strategy emphasizes keeping pawns spread across the track. Push the leader quickly while keeping a back-runner advancing. The CPU plays random legal moves, so consistent pip management wins reliably. Final score is 100 plus your pip-count lead at game end. A clean Sorry! Classic win usually scores +30 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SorryClSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sorrycl-btn", pulses: 3 }; },
  component: SorryClGame,
};
