import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CandyState, CandyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CandyLand } from "./Game.js";

export const candyLandSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type CandyLandSettingsType = SettingsOf<typeof candyLandSettings>;

export const candyLandPlugin: GamePlugin<CandyState, CandyAction, typeof candyLandSettings> = {
  id: "candy-land",
  title: "Candy Land",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Race along the sugary path by drawing color cards. Watch out for Gloppy's Swamp!",
  howToPlay: `Candy Land is a classic kids race game played on a 50-space path of colored squares. The path repeats a cycle of six colors: red, orange, yellow, green, blue, and purple. Your goal is to reach the end of the path before your opponents.

On your turn, click "Draw Card" to flip a color card from the deck. Your piece advances to the next square of that color along the path. For example, if you draw orange, you jump to the very next orange square ahead of you. Simple and fun!

Special cards spice things up. Draw a Double Red card and you zoom forward to the second red square instead of the first — a nice boost! But beware the location cards: Gumdrop Pass teleports you to square 12, and Gloppy's Swamp sends you back to square 28. These can help or hurt depending on where you are.

First player to reach or pass square 50 wins the game! Bots take their turns automatically after you draw. The entire game is luck-based — perfect for young children learning to take turns and follow a path.

You can play against 1, 2, or 3 bot opponents. Watch the progress bar to see who is winning the sweet race to the Candy Castle!`,
  settings: candyLandSettings,
  initialState: (seed: number, settings: CandyLandSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-candy-land-action"]', pulses: 3 }; },
  component: CandyLand,
};
