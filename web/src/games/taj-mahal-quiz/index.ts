import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TajMahalQuizState, TajMahalQuizAction, TajMahalQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TajMahalQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tajMahalQuizPlugin: GamePlugin<TajMahalQuizState, TajMahalQuizAction, typeof settings> = {
  id:"taj-mahal-quiz", title:"Taj Mahal Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Taj Mahal's history, construction, and design.",
  howToPlay:`Taj Mahal Quiz tests your knowledge of the world's most famous mausoleum. Questions cover the construction commissioned by Mughal Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal, who died in childbirth in 1631. You'll be quizzed on the 20+ year construction starting in 1632 and the ~20,000 workers who built it.

Topics include the white Makrana marble that gives the Taj its luminous appearance, the pietra dura inlay technique with semi-precious stones, the Mughal architectural style, the four minarets, the symmetrical mosque and guesthouse flanking the main building, and the great central dome that rises 73 meters with its finial. The Yamuna River setting, the gardens before the tomb, and the Taj's designation as a UNESCO World Heritage Site and 2007 New Seven Wonder all show up.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Beauty is eternal!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TajMahalQuizSettings),
  reducer,isTerminal,
  hint: (state: TajMahalQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TajMahalQuizGame,
};
