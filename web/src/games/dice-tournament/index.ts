import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTournamentState, DiceTournamentAction, DiceTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTournamentPlugin: GamePlugin<DiceTournamentState, DiceTournamentAction, typeof settings> = {
  id:"dice-tournament", title:"Dice Tournament", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"5-stage dice tournament: beat the bracket opponent each stage.",
  howToPlay:"Dice Tournament is a 5-stage knockout bracket where each round you face a tougher CPU opponent. Tap Roll to throw 2d6; the CPU then rolls its own 2d6. Higher total wins the bracket round.\n\nEach stage's win is worth more than the last: Round 1 = 10 pts, Round 2 = 15, Round 3 = 20, Round 4 = 25, Final = 30. A perfect bracket sweep banks 100 points. Losses score zero — but you continue through the bracket to play each stage anyway.\n\nTap Roll to fire the dice. The pair of dice for each side is shown along with totals. Press Next to advance to the next stage.\n\nSince both sides roll independent 2d6, expected win rate per stage is ~46% (with ~12% ties as zero-points). A typical run scores 30-60 points, with the dream bracket sweep at 100. Dice Tournament is a tense, escalating dice arc.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTournamentSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-dice-tournament-primary"]', pulses: 3 }), component:DiceTournamentGame,
};
