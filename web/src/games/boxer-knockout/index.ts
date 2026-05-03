import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoxerState, BoxerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BoxerKnockout } from "./BoxerKnockout.js";

export const boxerKnockoutSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type BoxerKnockoutSettingsType = SettingsOf<typeof boxerKnockoutSettings>;

export const boxerKnockoutPlugin: GamePlugin<BoxerState, BoxerAction, typeof boxerKnockoutSettings> = {
  id: "boxer-knockout",
  title: "Boxer Knockout",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Face off against an AI opponent in a tactical boxing match.",
  howToPlay: `Step into the ring and face your AI opponent across five rounds of tactical boxing. Each exchange you choose one of three moves: Punch, Block, or Dodge.

Punch throws a direct jab at your opponent. If they also punch, both fighters trade damage. If they block, your punch is absorbed for minimal damage. If they dodge, you miss entirely.

Block raises your guard. A blocked punch stops all incoming damage, but you deal none either. Blocking while the opponent dodges or blocks does nothing.

Dodge slips to the side. If the opponent throws a punch, you counter for heavy damage — your best offensive play. Against a blocking or dodging opponent, the dodge is wasted.

Each action earns points: counters score the most (10), hits score 5, successful blocks score 2. Knocking your opponent to zero HP ends the fight early with a 50-point bonus. After five rounds, whoever has more HP wins.

Read the opponent — on Hard difficulty they block and dodge more frequently. Mix your moves to stay unpredictable. A well-timed dodge into a counter is the fastest route to a knockout.`,
  settings: boxerKnockoutSettings,
  initialState: (seed: number, settings: BoxerKnockoutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-boxer-knockout-action"]', pulses: 3 }; },
  component: BoxerKnockout,
};
