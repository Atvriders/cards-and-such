import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZanzibarDiceState, ZanzibarDiceAction, ZanzibarDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZanzibarDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const zanzibarDicePlugin: GamePlugin<ZanzibarDiceState, ZanzibarDiceAction, typeof settings> = {
  id:"zanzibar-dice", title:"Zanzibar", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Swiss 1-4-6 three-dice game. Special combos score huge. 10 rounds.",
  howToPlay:"Zanzibar is a Swiss bar dice game where the prized roll is 1-4-6 — the eponymous \"Zanzibar.\" It's a three-dice game with category-based scoring familiar to Yahtzee fans but with unique combos.\n\nIn this 10-round single-roll version, you roll three dice each round. The system finds the best Zanzibar category: Zanzibar (1-4-6 in any order) = 80, Triple (3-of-a-kind) = face × 30 (1s = 1000... here capped to face × 30 for fairness), Triple 1s = 100, Straight (1-2-3 or 4-5-6) = 50, Pair = pair-face × 5 + odd-die, otherwise dice sum.\n\n10 rounds total. The Zanzibar 1-4-6 has odds 6/216 = 1/36, so you'll see one about a third of sessions on average — but landing it is the game's iconic moment.\n\nAverage expected score: 100-200 points. Roll boldly, hunt for the Zanzibar.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZanzibarDiceSettings),
  reducer,isTerminal,
  hint: (state: ZanzibarDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-zanzibar-dice-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-zanzibar-dice-next"]', pulses: 3 };
    return null;
  },
  component:ZanzibarDiceGame,
};
