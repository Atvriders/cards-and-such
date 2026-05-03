import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type MarsColonyState, type MarsColonyAction } from "./state.js";
import { MarsColonyGame } from "./Game.js";

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

export const marsColonyPlugin: GamePlugin<MarsColonyState, MarsColonyAction, typeof settings> = {
  id: "mars-colony",
  title: "Mars Colony",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build and manage a Mars colony — balance oxygen, food, and minerals to survive 15 turns!",
  howToPlay: `Mars Colony is a resource-management simulation. You are the administrator of humanity's first permanent settlement on Mars. Your colonists need oxygen, food, and minerals to survive and grow.

Each turn you may build one or more structures before pressing End Turn. Habitats generate oxygen and allow colonist growth. Farms produce food. Mines extract minerals. Labs generate research points used for advanced construction.

When you end your turn, all buildings produce their resources, colonists consume oxygen and food, and — if conditions are right — your population grows by one. If oxygen or food ever drops to zero, the colony fails!

Plan your construction order carefully. Build farms and habitats early to secure a stable supply chain, then expand with mines and labs to accumulate wealth for a high score. A thriving colony at turn 15 scores big — every surviving colonist and accumulated research counts.

Difficulty: Easy boosts production by 20%; Hard reduces it by 20%, making every decision critical.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-mars-colony-action"]', pulses: 3 }; },
  component: MarsColonyGame,
};
