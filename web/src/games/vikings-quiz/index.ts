import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VikingsQuizState, VikingsQuizAction, VikingsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VikingsQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const vikingsQuizPlugin: GamePlugin<VikingsQuizState, VikingsQuizAction, typeof settings> = {
  id:"vikings-quiz", title:"Vikings Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Norse mythology, Viking explorers, ships, and raids.",
  howToPlay:`Vikings Quiz challenges your knowledge of the Norse world. Questions cover Norse gods like Odin, Thor, and Loki; famous explorers like Leif Erikson; Viking ships and weapons; the great world-tree Yggdrasil; Valhalla and Valkyries; the runic writing system; and famous raids like Lindisfarne.

Each round shows a question with four answer choices. Pick the one you think is right. The correct answer turns green; a wrong guess turns red. Press Next to continue.

Each right answer earns 10 points. Choose 5, 10, or 15 questions in Settings for a quick or full session.

Key facts: Leif Erikson reached North America; Eric the Red settled Greenland; the longship was the iconic Viking vessel; the Thing was their parliament; Huginn and Muninn were Odin's ravens; runes were their writing system. Know these and you will dominate the quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as VikingsQuizSettings),
  reducer,isTerminal,
  hint: (state: VikingsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:VikingsQuizGame,
};
