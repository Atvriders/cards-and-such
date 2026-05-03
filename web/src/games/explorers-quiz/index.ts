import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ExplorersState, ExplorersAction, ExplorersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ExplorersQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ExplorersQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const explorersQuizPlugin: GamePlugin<ExplorersState, ExplorersAction, typeof settings> = {
  id: "explorers-quiz", title: "Explorers Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of history's great explorers — from Columbus and Magellan to Amundsen and Hillary.",
  howToPlay: `Explorers Quiz takes you on a journey through centuries of discovery — from Viking voyages to the age of European exploration, from polar expeditions to Everest summits. Questions cover who discovered what, when, for which nation, and with what ship.

You have 15 seconds per question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Swift and accurate answers yield the top scores.

Click your choice, then press Submit. The correct answer turns green; wrong selections turn red. Press Next to continue your expedition.

Choose 10, 20, or 30 questions in Settings from a pool covering Columbus, Magellan, Vasco da Gama, James Cook, Roald Amundsen, Ernest Shackleton, and many more brave adventurers who pushed beyond the known world.

Chart a course for knowledge and see how far your explorer's instinct takes you!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as ExplorersSettings),
  reducer, isTerminal, 
  hint: (state: ExplorersState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ExplorersQuiz,
};
