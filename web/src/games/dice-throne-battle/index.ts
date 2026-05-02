import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceThroneBattleState, DiceThroneBattleAction, DiceThroneBattleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceThroneBattleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceThroneBattlePlugin: GamePlugin<DiceThroneBattleState, DiceThroneBattleAction, typeof settings> = {
  id:"dice-throne-battle",
  title:"Dice Throne Battle",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Yahtzee-style fantasy hero combat.",
  howToPlay:"Dice Throne Battle is a 10-round combat dice game inspired by the dice-fighter. Each round you roll five dice and tally Yahtzee-style: 1+the sum of all dice for No-Match. Pair: +3, Two Pair: +6, Three of a Kind: +10, Full House: +15, Four of a Kind: +20, Five of a Kind: +30. 👑\n\nMost rounds you'll see pairs or triples. Across 10 rounds expect totals between 80 and 130. A Yahtzee (five of a kind) is rare and explosive — a 30-point bonus on top of the dice sum.\n\nPress Roll to attack, then Next to advance to the next round. The matched dice glow gold. The bonus tier is named for clarity. Score 120+ to be a Dice Throne champion. Each round captures the snappy combat of the original in a quick fantasy ride finishing in less than a minute. Combine luck with the thrill of seeing matching dice line up.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceThroneBattleSettings),
  reducer,
  isTerminal,
  hint: (state: DiceThroneBattleState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-throne-battle-roll"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-throne-battle-next"]', pulses: 3 };
  return null;
  },
  component:DiceThroneBattleGame,
};
