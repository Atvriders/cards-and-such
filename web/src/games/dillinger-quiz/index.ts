import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DillingerQuizState, DillingerQuizAction, DillingerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DillingerQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dillingerQuizPlugin: GamePlugin<DillingerQuizState, DillingerQuizAction, typeof settings> = {
  id:"dillinger-quiz", title:"John Dillinger Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of bank robber John Dillinger.",
  howToPlay:"John Dillinger Quiz tests your knowledge of one of America's most notorious Depression-era criminals. From his Indiana boyhood through a 1924 grocery-store robbery and a long prison stint that connected him to hardened convicts, Dillinger became the symbol of organized bank robbery in the early 1930s — and a thorn in the side of the FBI under J. Edgar Hoover.\n\nQuestions cover the Dillinger Gang, daring jail breaks at Lima and Crown Point, the wooden gun escape, the Little Bohemia gunfight, his death outside the Biograph Theater in Chicago in July 1934, and the lady-in-red Anna Sage who set him up.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn zero. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DillingerQuizSettings),
  reducer,isTerminal,
  hint: (state: DillingerQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DillingerQuizGame,
};
