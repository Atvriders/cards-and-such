import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleTossState, TripleTossAction, TripleTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TripleTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tripleTossPlugin: GamePlugin<TripleTossState, TripleTossAction, typeof settings> = {
  id:"triple-toss", title:"Triple Toss", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice. All three same +100, two same +20. 12 rounds.",
  howToPlay:`Triple Toss is a quick three-dice gambler. Each round, three dice are rolled. If all three show the same number, you score 100 points. If exactly two match (any pair), you score 20. If all three are different, you score nothing.

You play 12 rounds. The probability of all three matching is about 2.8%; the probability of at least one pair is around 44%. Average expected score over 12 rounds lands near 140 points. A run of 200 means you got at least one triple plus several pairs — solid! 300 means the dice loved you. Five hundred or more is fortune-favors-the-fool territory.

After each round, press Next to continue. There's no choice — just press Roll, see the dice, and let the matching gods decide. A full game takes only a minute or two; perfect for a coffee-break dice fix.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TripleTossSettings),
  reducer,isTerminal,
    hint: (state: TripleTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-triple-toss-action"]', pulses: 3 };
    },
  component:TripleTossGame,
};
