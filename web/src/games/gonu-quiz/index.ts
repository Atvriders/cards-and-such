import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GonuState, GonuAction, GonuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GonuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GonuGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gonuPlugin: GamePlugin<GonuState, GonuAction, typeof settings> = {
  id:"gonu-quiz", title:"Gonu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Gonu, the Korean tigers-and-goats abstract game.",
  howToPlay:"Gonu (also spelled 'Konu') is a family of traditional Korean abstract board games — most famously the tigers-vs-goats variant where one player controls predators that capture by jumping, while the other controls prey that try to immobilize the predators by surrounding them. Gonu boards range from small grids to elaborate cross-and-circle layouts. It belongs to the worldwide tigers-and-goats family alongside Bagh-Chal in Nepal and Komikan in Sri Lanka.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GonuSettings),
  reducer,isTerminal,
  hint: (state: GonuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GonuGame,
};
