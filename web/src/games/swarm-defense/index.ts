import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwarmDefenseState, SwarmDefenseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SwarmDefense } from "./SwarmDefense.js";

export const swarmDefenseSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal",
  },
} as const;

type SwarmDefenseSettingsType = SettingsOf<typeof swarmDefenseSettings>;

export const swarmDefensePlugin: GamePlugin<SwarmDefenseState, SwarmDefenseAction, typeof swarmDefenseSettings> = {
  id: "swarm-defense",
  title: "Swarm Defense",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build towers to stop waves of enemies from reaching your base.",
  howToPlay: `Swarm Defense is a real-time tower-defense arcade game. Enemies spawn at the top of a 10-column grid and march downward one row per game tick. Your base sits at the bottom row — if any enemy reaches it, you lose one base hit point. Lose all 10 HP and the game is over.

Click any column to select it (highlighted in gold), then click Build Tower to place a tower there for 5 gold. Towers permanently occupy a column and automatically deal 1 damage to every enemy that passes through their column on each tick. Enemies with 0 HP are eliminated and you earn 10 score points.

You start with 15 gold and earn 1 gold per game tick passively. Spend gold wisely: cover the columns receiving the most enemy traffic. Enemies grow harder as waves advance — higher waves spawn more enemies per tick with more HP.

Difficulty controls the tick speed and wave intensity. Easy gives more reaction time and weaker enemies. Hard moves faster with tougher, faster-spawning enemies.

Strategy: spread towers across columns to maximise coverage early. Once gold is flowing, fill gaps and upgrade coverage on high-traffic columns.`,
  settings: swarmDefenseSettings,
  initialState: (seed: number, settings: SwarmDefenseSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-swarm-defense-action"]', pulses: 3 }; },
  component: SwarmDefense,
};
