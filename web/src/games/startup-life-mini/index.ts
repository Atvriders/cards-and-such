import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StartupState, StartupAction, StartupSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StartupLifeMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const startupLifeMiniPlugin: GamePlugin<StartupState, StartupAction, typeof settings> = {
  id: "startup-life-mini",
  title: "Startup Life Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a startup. Roll for funding, hires, and milestones. Reach $1M valuation to IPO.",
  howToPlay: `Startup Life Mini compresses the founder journey into a 30-turn dice grind. You begin with $50,000 in the bank, 1 hire (you), and 0 product milestones. Your goal is to reach $1,000,000 valuation and IPO before you run out of cash or turns.

How to play:
1. Press Roll Dice each turn. The roll picks one of six events:
   — 1: Burn rate (–$5k per hire — payroll bleeds you each turn).
   — 2: Hire engineer (–$10k cash, +1 hire).
   — 3: Product milestone (+1 of 10).
   — 4: Revenue (+$25k per hire — bigger team scales income).
   — 5: Funding round (+$100k cash).
   — 6: Series A jackpot (+$250k, +2 milestones).

2. Press Next to advance to the next turn.

Valuation is automatically calculated as cash + ($50k × hires) + ($100k × milestones). You IPO the moment valuation reaches $1M. You bust if cash drops below –$100k. Otherwise the game ends after 30 turns.

Score = floor(valuation / 1000), with a 1000-point bonus for hitting IPO. The trick: hiring grows revenue but burns cash, so balance growth and runway. Aim for IPO bonus + 1000 score for a great run.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StartupSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sl-btn", pulses: 3 }; },
  component: StartupLifeMiniGame,
};
