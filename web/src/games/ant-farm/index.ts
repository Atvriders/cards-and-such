import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type AntFarmState, type AntFarmAction } from "./state.js";
const AntFarmGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AntFarmGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

export const antFarmPlugin: GamePlugin<AntFarmState, AntFarmAction, typeof settings> = {
  id: "ant-farm",
  title: "Ant Farm",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Manage your ant colony — recruit workers, soldiers, and nurses to survive 20 turns!",
  howToPlay: `Ant Farm is a colony resource simulation. You are the queen of a fledgling ant colony, and your job is to survive 20 turns by managing food production, population growth, and defense against threats.

Each turn you may recruit new ants at a cost of 3 food each. Choose wisely: Workers gather food each turn (more tunnels boost their yield), Soldiers defend against random predator attacks, and Nurses help the colony grow by nursing eggs to adulthood.

You may also spend 5 food to dig a new tunnel, permanently increasing worker productivity. When you are ready, press End Turn. Workers harvest food, the colony consumes food based on population, and nurses enable population growth. Random threats may appear — if your soldiers can't repel them, ants die.

The game ends when you run out of food, your population reaches zero, or you survive all 20 turns. Your score is based on final population, tunnels dug, and remaining food. Build a balanced colony to maximize your score!`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".af-btn", pulses: 3 }; },
  component: AntFarmGame,
};
