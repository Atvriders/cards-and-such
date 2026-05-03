import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TapaState, TapaAction, TapaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tapa } from "./Tapa.js";

export const tapaSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type TapaSettingsType = SettingsOf<typeof tapaSettings>;

export const tapaPlugin: GamePlugin<TapaState, TapaAction, typeof tapaSettings> = {
  id: "tapa",
  title: "Tapa",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells to form one connected group; clue numbers describe the groups of shaded neighbors.",
  howToPlay: `Tapa is a Turkish shading puzzle (invented by Serkan Yürekli). The grid contains some white clue cells with numbers. Your task is to shade non-clue cells following three rules.

Clue rule: each clue cell shows one or more numbers, such as "3", "1,2", or "2,2". These describe the sizes of consecutive groups of shaded cells among the eight neighboring cells (including diagonals), read clockwise. For example, "1,2" means there is one group of one shaded neighbor and one group of two shaded neighbors. Multiple numbers are listed in any order.

Connectivity rule: all shaded cells must form exactly one connected group (orthogonal connections only).

No 2×2 rule: no 2×2 block of cells may be entirely shaded.

Clue cells themselves are never shaded. Click a cell to cycle: empty → shaded (black) → dot (· reminder mark) → empty. Clue numbers turn green when the current neighbor arrangement matches.

Strategy: corners and edges limit neighbor positions, making them easier to deduce. Start there. Use the no-2×2 rule to quickly eliminate shading options. The connectivity rule links regions together — an isolated shaded area would be invalid.`,
  settings: tapaSettings,
  initialState: (seed: number, settings: TapaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-tapa-action"]', pulses: 3 }; },
  component: Tapa,
};
