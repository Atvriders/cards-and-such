import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PrimatesQuizState, PrimatesQuizAction, PrimatesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PrimatesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const primatesQuizPlugin: GamePlugin<PrimatesQuizState, PrimatesQuizAction, typeof settings> = {
  id:"primates-quiz", title:"Primates Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of monkeys, apes, lemurs and tarsiers.",
  howToPlay:"Primates Quiz explores the order Primates — humans' closest relatives. Questions cover the difference between monkeys and apes, the great apes (chimpanzees, gorillas, orangutans, bonobos, humans), prosimians (lemurs, lorises, tarsiers), New World vs Old World monkeys, social behavior, intelligence, and conservation issues facing these endangered animals.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The right answer is revealed before you continue. Whether you've watched gorillas in Rwanda, studied chimpanzee research, or marveled at lemurs in Madagascar, this quiz puts your primate knowledge front and center. Swing on in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PrimatesQuizSettings),
  reducer,isTerminal,
  hint: (state: PrimatesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PrimatesQuizGame,
};
