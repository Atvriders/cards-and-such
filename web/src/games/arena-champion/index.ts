import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ArenaChampionState, ArenaChampionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArenaChampion } from "./Game.js";

export const arenaChampionPlugin = {
  id: "arena-champion",
  title: "Arena Champion",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fight 8 opponents in the gladiatorial arena using four tactical combat moves.",
  howToPlay: `Arena Champion is a turn-based gladiatorial combat game. You fight 8 opponents in sequence, each tougher than the last, working your way up to become Arena Champion.

Each round you choose one of four moves: Heavy Strike (2d6+2 damage, powerful but no defense), Quick Strikes (two 1d4+1 hits, good against armored foes), Feint (deals light damage but halves the opponent's next attack — great against hard hitters), and Brace (+6 damage reduction for this exchange, plus whatever hits you do).

After your move, the opponent attacks. Damage is reduced by the opponent's defense score and any bracing. You heal 25% max HP between fights.

Opponents vary in style: early fighters have low defense and moderate attack. Mid-game introduces tanky enemies (use Quick Strikes to bypass armor) and fast attackers (use Feint often). The final champion has both high attack and defense — adapt your tactics.

Score 100 for winning all 8 fights. Losing earlier scores proportionally based on wins. Analyze each opponent's stats before choosing your move — the right tool for the right job.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: ArenaChampionState, action: ArenaChampionAction) => ArenaChampionState,
  isTerminal,
  component: ArenaChampion,
} as unknown as GamePlugin;
