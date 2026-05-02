import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BankBrandsQuizState, BankBrandsQuizAction, BankBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BankBrandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bankBrandsQuizPlugin: GamePlugin<BankBrandsQuizState, BankBrandsQuizAction, typeof settings> = {
  id:"bank-brands-quiz", title:"Bank Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"JPMorgan, HSBC, Goldman Sachs and global financial institutions.",
  howToPlay:"Bank Brands Quiz tests your knowledge of the global banking world. Questions cover headquarters, founding dates, famous CEOs, mergers, central banks, retail giants, investment houses, and the financial crises and IPOs that shaped modern banking.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Open the vault — see if your knowledge of finance, banking, and Wall Street legend can earn you compounding interest!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BankBrandsQuizSettings),
  reducer,isTerminal,
  hint: (state: BankBrandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BankBrandsQuizGame,
};
