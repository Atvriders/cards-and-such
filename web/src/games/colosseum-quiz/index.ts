import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColosseumQuizState, ColosseumQuizAction, ColosseumQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColosseumQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const colosseumQuizPlugin: GamePlugin<ColosseumQuizState, ColosseumQuizAction, typeof settings> = {
  id:"colosseum-quiz", title:"Colosseum Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Roman Colosseum, gladiators, and emperors.",
  howToPlay:`Colosseum Quiz tests your knowledge of the most iconic structure of ancient Rome. Questions cover the Flavian Amphitheatre — its formal name — and its construction under emperors Vespasian (started) and Titus (completed it in AD 80). You'll be quizzed on its capacity (~50,000 spectators), its 80 numbered entrances, the velarium awning system, and the elaborate hypogeum below the arena floor.

Topics include the gladiator games that ran for 350+ years, the naumachiae (mock naval battles with the arena flooded), and the role of the emperor and crowd in determining a fallen gladiator's fate. The earthquakes that damaged it across the centuries, the Roman use of concrete and travertine, the famous Colosseum-fighting myth around emperor Commodus, and the Colosseum's status as a New Seven Wonder of the World all show up.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Are you not entertained?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColosseumQuizSettings),
  reducer,isTerminal,
  hint: (state: ColosseumQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ColosseumQuizGame,
};
