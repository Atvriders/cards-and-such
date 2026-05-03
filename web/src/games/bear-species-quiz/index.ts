import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BearSpeciesQuizState, BearSpeciesQuizAction, BearSpeciesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BearSpeciesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BearSpeciesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bearSpeciesQuizPlugin: GamePlugin<BearSpeciesQuizState, BearSpeciesQuizAction, typeof settings> = {
  id:"bear-species-quiz", title:"Bear Species Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify the world's eight species of bear.",
  howToPlay:"Bear Species Quiz tests your knowledge of the world's eight bear species — from the polar bear of the Arctic to the spectacled bear of South America, the panda of China to the sun bear of Southeast Asia. Questions cover habitat, diet, distinctive features, hibernation behavior, and conservation status of each species.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The right answer is revealed before you continue. Whether you're a wildlife biologist, a national park visitor, or just love bears, this quiz will sharpen your ursine knowledge. Bear up to the challenge!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BearSpeciesQuizSettings),
  reducer,isTerminal,
  hint: (state: BearSpeciesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BearSpeciesQuizGame,
};
