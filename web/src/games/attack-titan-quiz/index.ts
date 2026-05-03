import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AttackTitanQuizState, AttackTitanQuizAction, AttackTitanQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AttackTitanQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AttackTitanQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const attackTitanQuizPlugin: GamePlugin<AttackTitanQuizState, AttackTitanQuizAction, typeof settings> = {
  id:"attack-titan-quiz", title:"Attack on Titan Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Attack on Titan knowledge: Titans, Walls, the Survey Corps, and Eldia's secrets.",
  howToPlay:`Attack on Titan Quiz tests your knowledge of Hajime Isayama's dark fantasy epic. Questions cover the Walls, the Survey Corps, the Garrison, the Military Police, the Nine Titans, the Eldians, the Marleyans, the basement reveal, the Rumbling, Paradis Island, and every twist from Eren's transformation to the Founding Titan's awakening.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. From the breach of Wall Maria to the final episode's last image, prove your knowledge of one of the decade's most twisted epics.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AttackTitanQuizSettings),
  reducer,isTerminal,
  hint: (state: AttackTitanQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AttackTitanQuizGame,
};
