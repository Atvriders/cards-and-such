import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FantasyNovelsQuizState, FantasyNovelsQuizAction, FantasyNovelsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FantasyNovelsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fantasyNovelsQuizPlugin: GamePlugin<FantasyNovelsQuizState, FantasyNovelsQuizAction, typeof settings> = {
  id:"fantasy-novels-quiz", title:"Fantasy Novels Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tolkien, Rowling, Sanderson, Martin, and the great fantasy worlds.",
  howToPlay:`Fantasy Novels Quiz tests your knowledge of fantasy literature from Tolkien's Middle-earth to N.K. Jemisin's Broken Earth. Questions cover the foundational works (The Lord of the Rings, The Hobbit, The Chronicles of Narnia), the megaseries that defined a generation (Harry Potter, A Song of Ice and Fire, The Wheel of Time), and modern epics (Sanderson's Stormlight Archive and Mistborn, Rothfuss's Kingkiller Chronicle, Abercrombie's First Law).\n\nYou will face questions on Pratchett's Discworld, Gaiman's American Gods and Sandman, Pullman's His Dark Materials, Le Guin's Earthsea, and classic fantasy from White, Bradley, Eddings, Brooks, McCaffrey, and Feist.\n\nEach question has a 15-second timer; correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings.\n\nIf you can name three Mistborn metals or recite House Stark's words, you are ready. Beware the dragon — and good luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FantasyNovelsQuizSettings),
  reducer,isTerminal,component:FantasyNovelsQuizGame,
};
