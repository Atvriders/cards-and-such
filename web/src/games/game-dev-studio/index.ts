import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GameDevState, GameDevAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GameDevStudio } from "./Game.js";

export const gameDevStudioPlugin = {
  id: "game-dev-studio",
  title: "Game Dev Studio",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a small game studio over 24 months — manage a dev team, build hype, choose genres, and ship games that sell!",
  howToPlay: `Game Dev Studio puts you in charge of an indie game development company for 24 months. Your goal is to release games that earn strong reviews and high sales.

Each month you choose between developing your current game (Dev Month) or shipping it (Launch!). Pick your Genre before development starts: Puzzle (small scope, fast), Platformer (medium), Shooter (large), Sim (large), or RPG (biggest scope, highest reward).

Manage your Team Size (1–8 developers at $200/month each). More devs build Quality Points faster. Set your Marketing Budget ($0–$300/month) to accumulate Hype — which boosts launch sales and review scores.

Enable Quality Focus (+$100/month) to gain bonus quality each month and reduce randomness. Each genre has a Quality Threshold — launching before meeting it results in mediocre reviews and poor sales.

Revenue comes only at launch. Review Score (0–100) depends on quality and hype, and determines how many copies sell at your genre's price point. Launch too early and reviews tank; wait too long and you burn cash on payroll.

Strategy: Start with a small Puzzle game to build cash quickly. Then invest in a bigger RPG with a large team and strong marketing. Target $8000 by month 24!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: GameDevState, action: GameDevAction) => GameDevState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".gds-btn", pulses: 3 }; },
  component: GameDevStudio,
} as unknown as GamePlugin;
