import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BankCrapsState, BankCrapsAction, BankCrapsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BankCrapsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bankCrapsPlugin: GamePlugin<BankCrapsState, BankCrapsAction, typeof settings> = {
  id:"bank-craps", title:"Bank Craps", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Standard casino craps simplified. 10 rounds; pass-line auto-bets.",
  howToPlay:"Bank Craps is the standard house-banked casino craps experience. The dealer (the bank) handles all bets, and players make pass-line wagers on whether the shooter will roll a winning sequence.\n\nIn this 10-round single-roll simplification, each round auto-bets the pass-line. You roll two dice as the come-out roll: 7 or 11 = pass-line win (+25); 2, 3, or 12 = craps loss (0); 4, 5, 6, 8, 9, 10 = \"point\" established. For points, the system auto-rolls a follow-up to resolve: if the second roll matches the point = point made (+30); if 7 = seven-out (0); else partial (+5).\n\n10 rounds total. Average expected score: 80-180 points. The pass-line edge in actual craps is small (~1.4% house edge); this simplification approximates that with smaller per-roll variance.\n\nClassic casino dice in single-player form. Look for the natural 7 on come-out!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BankCrapsSettings),
  reducer,isTerminal,
  hint: (state: BankCrapsState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-bank-craps-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-bank-craps-next"]', pulses: 3 };
    return null;
  },
  component:BankCrapsGame,
};
