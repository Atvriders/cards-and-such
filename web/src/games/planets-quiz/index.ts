import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PlanetsQuizState, PlanetsQuizAction, PlanetsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PlanetsQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PlanetsQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const planetsQuizPlugin: GamePlugin<PlanetsQuizState, PlanetsQuizAction, typeof settings> = {
  id:"planets-quiz", title:"Planets Quiz", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Explore our solar system — planets, moons, rings, storms, and spacecraft.",
  howToPlay:`Planets Quiz takes you on a tour of our solar system. Questions cover the eight planets, their moons, distinctive features, atmospheric composition, rotation, and famous space missions.

Select one of four answers and press Submit. Each correct answer earns 100 points. After submitting, the correct answer is revealed so you can expand your astronomy knowledge.

Topics include: planet sizes (Jupiter is the largest, Mercury the smallest), temperatures (Venus is hotter than Mercury despite being farther from the Sun!), moons (Saturn now has the most known moons), rings (Saturn's are made of ice and rock), distinctive storms (Jupiter's Great Red Spot, Neptune's Great Dark Spot), extreme tilt (Uranus), and famous spacecraft like Voyager 1.

Use Settings to choose 10 or 20 questions. Questions are randomly selected and choices shuffled each game. From casual stargazers to space enthusiasts, this quiz offers fascinating facts about the worlds in our cosmic neighborhood!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PlanetsQuizSettings),
  reducer, isTerminal, 
  hint: (state: PlanetsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PlanetsQuiz,
};
