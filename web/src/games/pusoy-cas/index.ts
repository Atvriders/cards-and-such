import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PusoyCasState, PusoyCasAction, PusoyCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PusoyCasGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pusoyCasPlugin: GamePlugin<PusoyCasState, PusoyCasAction, typeof settings> = {
  id:"pusoy-cas", title:"Pusoy", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pusoy, the Filipino climbing card game in the Big Two family.",
  howToPlay:"Pusoy Trivia is a ten-question quiz about Pusoy (also called Big Two in some regions), a Filipino climbing card game closely related to Tien Len and Big Two. Played by four players using a standard 52-card deck (each gets 13 cards), the object is to be the first to empty your hand. Players play singles, pairs, triples, or five-card combinations such as straights, flushes, full houses, four-of-a-kinds, and straight flushes. The Two is highest single in classic rules and the Three of Diamonds (or Clubs) typically begins the first round. Each question tests rules, combinations, hierarchy, and history of Pusoy. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Pusoy is a beloved staple of Filipino card culture.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PusoyCasSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-pusoy-cas-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-pusoy-cas-submit"]', pulses: 3 };
    return null;
  },component:PusoyCasGame,
};
