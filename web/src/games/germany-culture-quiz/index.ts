import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GermanyCultureQuizState, GermanyCultureQuizAction, GermanyCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GermanyCultureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const germanyCultureQuizPlugin: GamePlugin<GermanyCultureQuizState, GermanyCultureQuizAction, typeof settings> = {
  id:"germany-culture-quiz", title:"Germany Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"German culture: beer, history, music, and engineering.",
  howToPlay:"Germany Culture Quiz tests your knowledge of Deutschland's contributions to the world. Questions cover Goethe and Schiller, Bach, Beethoven, and Wagner, the Reformation under Martin Luther, the Holy Roman Empire, Bismarck's unification, the World Wars and the Berlin Wall, modern reunification, plus contemporary culture: Oktoberfest, bratwurst, BMW, autobahns, and the Bundesliga.\n\nYou have 15 seconds per question. Correct answers earn 100 points plus 10 per second remaining; wrong answers score zero but show the right answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to move on.\n\nChoose 10 or 20 questions in Settings. Whether you've raised a stein at Oktoberfest, road-tripped the Romantic Road, or geek out on Bach fugues, this quiz will challenge your German cultural literacy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GermanyCultureQuizSettings),
  reducer,isTerminal,
  hint: (state: GermanyCultureQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GermanyCultureQuizGame,
};
