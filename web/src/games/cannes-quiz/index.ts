import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CannesQuizState, CannesQuizAction, CannesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CannesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CannesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cannesQuizPlugin: GamePlugin<CannesQuizState, CannesQuizAction, typeof settings> = {
  id:"cannes-quiz", title:"Cannes Film Festival Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Cannes Film Festival.",
  howToPlay:"Cannes Film Festival Quiz tests your knowledge of cinema's most glamorous gathering. Founded in 1946 on the French Riviera, Cannes has become the world's most important arthouse and prestige film showcase, with the Palme d'Or as its top prize.\n\nQuestions cover famous Palme winners (Pulp Fiction, Apocalypse Now, Taxi Driver, Parasite, Dancer in the Dark, The Tree of Life), historic juries, opening films, the Croisette and Grand Théâtre Lumière, the Marché du Film, and the festival's role in launching directors like Almodóvar, Tarantino, Iñárritu, and Bong Joon-ho.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CannesQuizSettings),
  reducer,isTerminal,
  hint: (state: CannesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CannesQuizGame,
};
