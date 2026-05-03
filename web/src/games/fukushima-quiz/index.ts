import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FukushimaQuizState, FukushimaQuizAction, FukushimaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FukushimaQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FukushimaQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fukushimaQuizPlugin: GamePlugin<FukushimaQuizState, FukushimaQuizAction, typeof settings> = {
  id:"fukushima-quiz", title:"Fukushima Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 2011 Fukushima Daiichi nuclear accident.",
  howToPlay:"Fukushima Quiz tests your knowledge of the 2011 nuclear disaster in Japan. Questions cover the magnitude 9.0 Tōhoku earthquake, the massive tsunami that flooded the Fukushima Daiichi plant, the meltdowns of three reactors, and the ongoing cleanup. You'll be asked about TEPCO, the IAEA INES rating, the evacuation zones, the comparison to Chernobyl, and the contaminated water released into the Pacific.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FukushimaQuizSettings),
  reducer,isTerminal,
  hint: (state: FukushimaQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FukushimaQuizGame,
};
