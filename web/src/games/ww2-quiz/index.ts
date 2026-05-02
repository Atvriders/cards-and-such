import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Ww2QuizState, Ww2QuizAction, Ww2QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Ww2QuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ww2QuizPlugin: GamePlugin<Ww2QuizState, Ww2QuizAction, typeof settings> = {
  id:"ww2-quiz", title:"WW2 Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of World War II — leaders, battles, turning points, and the aftermath.",
  howToPlay:`WW2 Quiz tests your knowledge of the world's deadliest conflict, fought from 1939 to 1945. Questions cover the invasion of Poland, Pearl Harbor, D-Day, Operation Barbarossa, the Holocaust, key leaders like Churchill, Roosevelt, Stalin, and Hitler, famous battles like Stalingrad and the Bulge, and the atomic bombings of Japan.

Each question offers four choices. Pick the correct one to earn 10 points. Green means right; red means wrong.

Press Next to continue. Choose 5, 10, or 15 questions in Settings.

Key facts: Germany invaded Poland in 1939; Pearl Harbor brought the US in December 1941; D-Day (Operation Overlord) was June 6 1944; Stalingrad was the Eastern Front turning point; Hiroshima and Nagasaki were bombed in August 1945; the United Nations was founded after the war. Know these to score perfectly!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Ww2QuizSettings),
  reducer,isTerminal,
  hint: (state: Ww2QuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Ww2QuizGame,
};
