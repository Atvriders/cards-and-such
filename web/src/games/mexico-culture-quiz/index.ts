import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexicoCultureQuizState, MexicoCultureQuizAction, MexicoCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MexicoCultureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mexicoCultureQuizPlugin: GamePlugin<MexicoCultureQuizState, MexicoCultureQuizAction, typeof settings> = {
  id:"mexico-culture-quiz", title:"Mexico Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mexican culture: cuisine, history, festivals, and traditions.",
  howToPlay:"Mexico Culture Quiz explores the people, history, and traditions south of the Rio Grande. Questions cover the ancient Aztec and Maya civilizations, Spanish colonization, the wars of independence and revolution, modern political figures, regional cuisines from Yucatán to Oaxaca, music ranging from mariachi to ranchera, the colorful celebrations of Día de los Muertos and Cinco de Mayo, and modern artists like Frida Kahlo and Diego Rivera.\n\nYou have 15 seconds per question. Correct answers earn 100 points plus 10 per second remaining; wrong answers earn zero but reveal the right answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you've watched a lucha libre match, savored mole poblano, or admired murals in Mexico City, this quiz will test your understanding of one of the world's most colorful cultures.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MexicoCultureQuizSettings),
  reducer,isTerminal,
  hint: (state: MexicoCultureQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MexicoCultureQuizGame,
};
