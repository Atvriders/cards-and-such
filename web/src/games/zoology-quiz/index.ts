import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZoologyQuizState, ZoologyQuizAction, ZoologyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ZoologyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ZoologyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const zoologyQuizPlugin: GamePlugin<ZoologyQuizState, ZoologyQuizAction, typeof settings> = {
  id:"zoology-quiz", title:"Zoology Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of mammals, birds, reptiles, and animal classifications.",
  howToPlay:"Zoology Quiz challenges you on the animal kingdom: mammals, birds, reptiles, fish, amphibians, invertebrates, and the taxonomy that classifies them. Questions span everything from how many legs a spider has to which bird is the only one able to fly backward and what makes a marsupial different from a placental mammal.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're an animal lover, a wildlife student, or simply love nature documentaries, this quiz will deepen your appreciation of the incredible variety of life on Earth!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZoologyQuizSettings),
  reducer,isTerminal,
  hint: (state: ZoologyQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ZoologyQuizGame,
};
