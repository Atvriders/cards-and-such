import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SetteBelloState, SetteBelloAction, SetteBelloSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SetteBelloGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const setteBelloPlugin: GamePlugin<SetteBelloState, SetteBelloAction, typeof settings> = {
  id:"sette-bello", title:"Sette Bello", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Sette Bello, the prized 'Beautiful Seven' of Coins from Scopa.",
  howToPlay:"Sette Bello Trivia is a ten-question quiz about the Sette Bello (Italian for 'Beautiful Seven'), the Seven of Coins (Sette di Denari) — the single most valuable card in Italian Scopa and its many variants. In standard Scopa scoring, capturing the Sette Bello earns one point in the final tally, and it is one of the four standard scoring categories (alongside cards, coins, primiera). The Sette Bello cannot be captured by exchange — it must be taken via direct match or sweep. Each question tests rules, scoring, and cultural significance of the Sette Bello in Scopa, Scopone, and related games. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SetteBelloSettings),
  reducer,isTerminal,component:SetteBelloGame,
};
