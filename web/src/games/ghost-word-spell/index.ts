import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GhostWordSpellState, GhostWordSpellAction, GhostWordSpellSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GhostWordSpellGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ghostWordSpellPlugin: GamePlugin<GhostWordSpellState, GhostWordSpellAction, typeof settings> = {
  id:"ghost-word-spell", title:"Ghost (Word)", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Ghost, the spelling word game where you avoid completing a word.",
  howToPlay:"Ghost Trivia is a ten-question quiz about Ghost, a classic spelling word game. Players take turns adding a letter to an evolving sequence. Each player must add a letter such that the sequence so far must be a valid prefix of at least one English word, but no player wants to be the one to complete an actual word. If a player completes a word, they receive a 'letter' (G, H, O, S, T) — five letters and you're 'ghosted out'. Players may also challenge an opponent to spell a word — if the challenged player can name a valid word starting with the prefix, the challenger gets a letter. Each question tests rules, history, and variants of Ghost. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GhostWordSpellSettings),
  reducer,isTerminal,component:GhostWordSpellGame,
};
