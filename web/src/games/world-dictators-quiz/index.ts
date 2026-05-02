import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WorldDictatorsQuizState, WorldDictatorsQuizAction, WorldDictatorsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WorldDictatorsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const worldDictatorsQuizPlugin: GamePlugin<WorldDictatorsQuizState, WorldDictatorsQuizAction, typeof settings> = {
  id:"world-dictators-quiz", title:"World Dictators Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Notorious authoritarian leaders of the 20th century and beyond.",
  howToPlay:"World Dictators Quiz tests your knowledge of the 20th and 21st century's most notorious authoritarian leaders. Questions span ideology, country and era of rule, length of regime, signature crimes against humanity, downfall, and the wider geopolitics of fascist, communist and nationalist regimes — Hitler, Stalin, Mao, Mussolini, Franco, Pol Pot, Saddam, and many others.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. A grim but important slice of history — see how well you know the warning signs of the modern era.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WorldDictatorsQuizSettings),
  reducer,isTerminal,
  hint: (state: WorldDictatorsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WorldDictatorsQuizGame,
};
