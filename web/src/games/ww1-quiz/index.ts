import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Ww1QuizState, Ww1QuizAction, Ww1QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Ww1QuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ww1QuizPlugin: GamePlugin<Ww1QuizState, Ww1QuizAction, typeof settings> = {
  id:"ww1-quiz", title:"WW1 Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of World War I — causes, battles, weapons, and the peace that followed.",
  howToPlay:`WW1 Quiz tests your knowledge of the Great War, fought from 1914 to 1918. Questions cover the assassination of Archduke Franz Ferdinand that sparked the conflict, trench warfare on the Western Front, new weapons like poison gas and tanks, famous battles like the Somme and Gallipoli, key alliances, and the Treaty of Versailles.

Each question offers four choices. Pick the correct answer to earn 10 points. Green means correct; red means wrong.

Press Next to continue. Choose 5, 10, or 15 questions in Settings.

Key facts: Franz Ferdinand was killed in Sarajevo in 1914; the Triple Entente opposed the Triple Alliance; Russia left the war after its revolution; the US entered in 1917 after the Zimmermann Telegram; the war ended November 11 1918; the Treaty of Versailles imposed harsh terms on Germany. Know these and score full marks!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Ww1QuizSettings),
  reducer,isTerminal,
  hint: (state: Ww1QuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Ww1QuizGame,
};
