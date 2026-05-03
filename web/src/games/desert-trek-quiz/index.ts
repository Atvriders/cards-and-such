import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DesertTrekQuizState, DesertTrekQuizAction, DesertTrekQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DesertTrekQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DesertTrekQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const desertTrekQuizPlugin: GamePlugin<DesertTrekQuizState, DesertTrekQuizAction, typeof settings> = {
  id:"desert-trek-quiz", title:"Desert Expedition Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of desert exploration and survival.",
  howToPlay:"Desert Expedition Quiz tests your knowledge of expeditions through Earth's most arid landscapes. Questions cover the Sahara, Gobi, Atacama, Empty Quarter, and Australian Outback, plus famous explorers like Wilfred Thesiger, Bertram Thomas, and the Burke and Wills expedition. You'll be asked about camels and water, navigation, oases, sandstorms, the camel caravan trade routes, and modern adventurers like Robyn Davidson.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DesertTrekQuizSettings),
  reducer,isTerminal,
  hint: (state: DesertTrekQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DesertTrekQuizGame,
};
