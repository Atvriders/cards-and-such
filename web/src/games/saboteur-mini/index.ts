import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SaboteurMiniState, SaboteurMiniAction, SaboteurMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SaboteurMiniGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const saboteurMiniPlugin: GamePlugin<SaboteurMiniState, SaboteurMiniAction, typeof settings> = {
  id: "saboteur-mini",
  title: "Saboteur Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Saboteur's hidden-role dwarf mining card game.`,
  howToPlay: `Saboteur Strategy Quiz tests your knowledge of the 2004 hidden-role mining card game by Frédéric Moyersoen. Dwarven miners race to dig a tunnel from the start card to the gold card while saboteurs secretly try to derail the dig.

Across 10 multiple-choice questions you'll cover: card types (path, action, dead-end, map), how saboteurs disrupt without revealing themselves, why blocking with broken-tool cards is a legitimate miner play, the gold-card placement at game start, and rounds-and-scoring across the three rounds of a typical game.

Each correct answer awards 100 points (1000 max). The right answer is revealed each round.

Tips: in early Saboteur, miners shouldn't immediately accuse blockers — sometimes a miner has bad path cards and is forced to play a dead-end-looking trick. Map cards are most useful in the second half. Gold detection often comes from indirect signals like who tools whom, not direct claims.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SaboteurMiniSettings),
  reducer,
  isTerminal,
  component: SaboteurMiniGame,
};
