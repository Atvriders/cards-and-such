import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RussianLitQuizState, RussianLitQuizAction, RussianLitQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RussianLitQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const russianLitQuizPlugin: GamePlugin<RussianLitQuizState, RussianLitQuizAction, typeof settings> = {
  id:"russian-lit-quiz", title:"Russian Literature Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tolstoy, Dostoevsky, Chekhov, and the Russian masters.",
  howToPlay:`Russian Literature Quiz tests your knowledge of one of the world's most powerful literary traditions. Questions cover the 19th-century giants — Pushkin, Lermontov, Gogol, Turgenev, Tolstoy, Dostoevsky, Chekhov — and stretch into the Soviet and post-Soviet eras with Bulgakov, Pasternak, Sholokhov, Nabokov, and Solzhenitsyn.\n\nYou will be tested on iconic novels (War and Peace, Crime and Punishment, Anna Karenina, The Brothers Karamazov, Doctor Zhivago, The Master and Margarita), key characters (Raskolnikov, Pierre Bezukhov, Anna), and Chekhov's classic plays (The Cherry Orchard, Three Sisters, Uncle Vanya).\n\nEach question has 15 seconds. Correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings.\n\nIf you can keep Tolstoy's tolerant aristocrats straight from Dostoevsky's tortured saints, you are ready. Da svidaniya — and good luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RussianLitQuizSettings),
  reducer,isTerminal,component:RussianLitQuizGame,
};
