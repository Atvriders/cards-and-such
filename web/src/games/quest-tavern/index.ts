import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { QuestTavernState, QuestTavernAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuestTavern = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuestTavern as unknown as React.ComponentType<unknown> })));
export const questTavernPlugin = {
  id: "quest-tavern",
  title: "Quest Tavern",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a quest tavern — hire adventurers, send them on quests, and grow your gold over 10 days.",
  howToPlay: `Quest Tavern puts you in charge of an adventurer's guild. Over 10 days you hire heroes, assign them to quests, and watch the gold roll in.

Each day you have a roster of available adventurers with different skill levels and hiring costs. Hire them with your gold, then assign them to available quests. Each quest has a difficulty rating and a gold reward. An adventurer's chance of success depends on how their skill matches the quest difficulty — skilled adventurers on easy quests succeed almost always, while weak adventurers on hard quests often fail.

Quests take time: a difficulty-3 quest takes 3 days. An adventurer is unavailable while on a quest. Plan ahead — if an adventurer returns on day 9, there may be no time to send them out again.

Every 3 days the market refreshes with new adventurers and quests. Manage your gold carefully: don't overspend on hires if you don't have quests for them.

Final score is based on both gold earned and number of quests completed. A top score needs around 80+ gold and 6+ completed quests across 10 days.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: QuestTavernState, action: QuestTavernAction) => QuestTavernState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".qt-btn", pulses: 3 }; },
  component: QuestTavern,
} as unknown as GamePlugin;
