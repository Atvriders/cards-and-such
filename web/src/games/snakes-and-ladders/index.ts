import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnakesState, SnakesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnakesAndLadders } from "./Game.js";

export const snakesSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type SnakesSettingsType = SettingsOf<typeof snakesSettings>;

export const snakesAndLaddersPlugin: GamePlugin<SnakesState, SnakesAction, typeof snakesSettings> = {
  id: "snakes-and-ladders",
  title: "Snakes & Ladders",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Classic 100-square race. Climb ladders, slide down snakes!",
  howToPlay: `Snakes and Ladders (also called Chutes and Ladders) is one of the oldest board games in the world, originating in ancient India. The board has 100 squares arranged in a 10x10 grid. You start off the board and race to reach square 100 first.

On your turn, click "Roll Die" to roll a single six-sided die and advance your token by that many squares. Movement follows a snaking path: from square 1 at the bottom-left, across to 10 at the bottom-right, then up and right-to-left for 11-20, and so on up to 100 at the top.

The exciting twists: if you land on the bottom of a ladder (shown with a ladder icon), you instantly climb to the top — a big shortcut! But if you land on a snake's head (shown with a snake icon), you slide all the way down to its tail — a painful setback.

If your roll would take you past square 100, you stay in place (you must land exactly on 100 or bounce). The first player to land on square 100 wins!

There are 10 ladders and 10 snakes on the board. Bots roll automatically after your turn. This game is entirely luck-based — no strategy, pure fun!`,
  settings: snakesSettings,
  initialState: (seed: number, settings: SnakesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-snakes-and-ladders-action"]', pulses: 3 }; },
  component: SnakesAndLadders,
};
