import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HazardDiceState, HazardDiceAction, HazardDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HazardDiceGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hazardDicePlugin: GamePlugin<HazardDiceState, HazardDiceAction, typeof settings> = {
  id:"hazard-dice", title:"Hazard", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Hazard, the historic English dice game and ancestor of Craps.",
  howToPlay:"Hazard Trivia is a ten-question quiz about Hazard, a centuries-old English dice game and the historical ancestor of modern Craps. The game uses two dice with a complex set of rules: the shooter chooses a 'main' (a number 5-9), then rolls. Outcomes can be a 'nick' (instant win), an 'out' (instant loss), or establish a 'chance' that the shooter must repeat before rolling the main. Hazard was wildly popular in 17th-19th-century English gentlemen's clubs and gambling halls. Each question tests rules, the 'main' and 'chance' system, terms, and history of Hazard. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HazardDiceSettings),
  reducer,isTerminal,
  hint: (state: HazardDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-hazard-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-hazard-dice-submit"]', pulses: 3 };
  },
  component:HazardDiceGame,
};
