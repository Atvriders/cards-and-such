import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraightGinState, StraightGinAction, StraightGinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StraightGinGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const straightGinPlugin: GamePlugin<StraightGinState, StraightGinAction, typeof settings> = {
  id:"straight-gin", title:"Straight Gin", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Straight Gin, a Gin Rummy variant that disallows knocking before gin.",
  howToPlay:"Straight Gin Trivia is a ten-question quiz about Straight Gin, a strict variant of Gin Rummy in which players cannot knock at any deadwood total — they must wait for full gin (zero deadwood) before going out. Played by two players with a standard 52-card deck, each receives 10 cards and draws from stock or discard each turn. The objective is to form all 10 cards into sets and runs. Without the option to knock early, hands often run longer and demand more discipline. Each question tests rules, scoring, strategy, and history of Straight Gin. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Straight Gin is the purist's Gin Rummy — patient, deliberate, and demanding.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StraightGinSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-straight-gin-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-straight-gin-submit"]', pulses: 3 };
    return null;
  },component:StraightGinGame,
};
