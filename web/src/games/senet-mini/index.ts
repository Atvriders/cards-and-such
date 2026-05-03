import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SenetMiniState, SenetMiniAction, SenetMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SenetMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const senetMiniPlugin: GamePlugin<SenetMiniState, SenetMiniAction, typeof settings> = {
  id: "senet-mini",
  title: "Senet (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Egyptian race; compact track with two stones per player.",
  howToPlay: "Senet is among the oldest known board games — the ancient Egyptians played it more than 5000 years ago. The full board has 30 squares arranged in three rows of ten and uses casting-sticks for movement. This Mini edition flattens the path to a single linear track of 18 cells with two stones per side.\n\nYou play one color against a random CPU. Click Roll to throw two six-sided dice (a simple stand-in for the four casting-sticks). Click one of your two stones and advance it by either die or by the combined sum.\n\nThe board appears horizontally as a 19-cell strip. The final cell represents the House of Re-Atoum — the exit from the board. Move both your stones there to win.\n\nSenet is largely a race of luck, but Egyptian players also tracked safe squares. In this simplified Mini edition, your only choice is which stone to move. Keep them close together so a bad roll doesn't strand the back stone. The CPU plays random legal moves, so steady play wins. Final score equals 100 plus your pip-count differential. A typical strong win is +10 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SenetMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".senet-mini-btn", pulses: 3 }; },
  component: SenetMiniGame,
};
