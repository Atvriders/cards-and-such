import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PharaohsQuizState, PharaohsQuizAction, PharaohsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PharaohsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PharaohsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pharaohsQuizPlugin: GamePlugin<PharaohsQuizState, PharaohsQuizAction, typeof settings> = {
  id:"pharaohs-quiz", title:"Pharaohs Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Egypt's ruling pharaohs across all dynasties.",
  howToPlay:`Pharaohs Quiz focuses on the rulers of ancient Egypt across three thousand years of history. Questions cover pyramid builders like Khufu, warrior pharaohs like Thutmose III, famous female rulers like Hatshepsut and Cleopatra, reformers like Akhenaten, and the legendary boy-king Tutankhamun.

Each question presents four choices. Select the one you believe is correct. Green means right, red means wrong — the correct answer always shows.

Press Next to continue. Each correct answer earns 10 points. Choose 5, 10, or 15 questions in Settings.

Key facts: Narmer unified Egypt; Djoser built the first step pyramid; Sneferu built the first true pyramid; Khufu built the Great Pyramid; Hatshepsut ruled as male king; Tutankhamun's tomb was found intact in 1922; Cleopatra VII was the last pharaoh. The uraeus cobra was a symbol of royal power. Learn these and score perfectly!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PharaohsQuizSettings),
  reducer,isTerminal,
  hint: (state: PharaohsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PharaohsQuizGame,
};
