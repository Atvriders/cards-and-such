import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MaxiYatzyState, MaxiYatzyAction, MaxiYatzySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MaxiYatzyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const maxiYatzyPlugin: GamePlugin<MaxiYatzyState, MaxiYatzyAction, typeof settings> = {
  id:"maxi-yatzy", title:"Maxi Yatzy", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Swedish 6-dice Yahtzee cousin with extra categories. 10 rounds, single-roll.",
  howToPlay:"Maxi Yatzy is the Swedish six-dice Yahtzee cousin, with categories that exploit the extra die. This version distills the experience into 10 single-roll rounds with automatic best-category scoring.\n\nEach round you roll six dice once. The system finds the best Maxi Yatzy category: Maxi Yatzy (6-of-a-kind) = 100, Five-of-a-kind = 60, Four-of-a-kind = 40, Castle (three-pair, 2+2+2) = 50, Tower (four+two) = 40, Big Straight (1-6) = 30, Small Straight (1-5 or 2-6 in 5 of the dice) = 25, otherwise dice sum.\n\n10 rounds total. Average expected score: 200-340 points. Maxi Yatzy is renowned for its three-pair \"Castle\" — a uniquely 6-dice combination unavailable in standard Yatzy.\n\nLook for big rolls and aim for the 100-point Maxi Yatzy crown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MaxiYatzySettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-maxi-yatzy-primary"]', pulses: 3 }), component:MaxiYatzyGame,
};
