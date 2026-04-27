import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BritishLitQuizState, BritishLitQuizAction, BritishLitQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BritishLitQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const britishLitQuizPlugin: GamePlugin<BritishLitQuizState, BritishLitQuizAction, typeof settings> = {
  id:"british-lit-quiz", title:"British Literature Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Chaucer to Ishiguro: a thousand years of British writing.",
  howToPlay:`British Literature Quiz spans roughly seven centuries of writing from the British Isles, starting with Chaucer's Canterbury Tales (14th century) and reaching contemporary masters like Kazuo Ishiguro and Hilary Mantel.\n\nQuestions cover Milton's Paradise Lost, the great 18th-century novelists (Defoe, Swift, Fielding, Sterne), the Brontes and Austen, Dickens and Eliot, Hardy and Forster. Modernists Woolf, Lawrence, and Joyce are well-represented, alongside dystopian giants Orwell and Huxley.\n\nYou will see questions on contemporary heavyweights too — Ian McEwan (Atonement), Salman Rushdie, Julian Barnes, A.S. Byatt, David Mitchell — and important post-war voices like Greene, Waugh, and Golding.\n\nEach question has 15 seconds; correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings. Now grab your tea and have a go!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BritishLitQuizSettings),
  reducer,isTerminal,component:BritishLitQuizGame,
};
