import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexicanPubDiceState, MexicanPubDiceAction, MexicanPubDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MexicanPubDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mexicanPubDicePlugin: GamePlugin<MexicanPubDiceState, MexicanPubDiceAction, typeof settings> = {
  id: "mexican-pub-dice",
  title: "Mexican Pub Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mexen pub variant — call Mexico, doubles, or other.",
  howToPlay: "Mexen, the Scandinavian pub dice game, uses two dice and the unique 'Mexico' result of 2-1 (a Mexico) as the highest hand. This adaptation captures that ranking through prediction. Across 12 rounds two dice are rolled. Predict: Mexico (one die shows 2, the other shows 1, in any order — total of 3 with a 2-1 split) pays +50, Doubles (both dice equal) pays +25, Other (anything else) pays +10. Mexico hits 2 of 36 = 5.6%, doubles 6 of 36 = 16.7%, other 28 of 36 = 77.8%. The Mexico bet is the long shot but pays a healthy bounty; doubles is moderate; other covers the bulk. Wrong call scores zero. Strategy: always-other is steady at +120 across twelve rounds; punt Mexico every fourth round and you expect about +30 bonus on average. Top score after twelve rounds wins. The Scandinavian pub original goes around the table with shouted bluffs; this adaptation focuses on the dice odds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MexicanPubDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-mexican-pub-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-mexican-pub-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-mexican-pub-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-mexican-pub-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mexican-pub-dice-next"]', pulses: 3 };
  },
  component: MexicanPubDiceGame,
};
