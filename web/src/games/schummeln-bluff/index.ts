import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SchummelnBluffState, SchummelnBluffAction, SchummelnBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SchummelnBluffGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const schummelnBluffPlugin: GamePlugin<SchummelnBluffState, SchummelnBluffAction, typeof settings> = {
  id: "schummeln-bluff",
  title: "Schummeln Bluff",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German open-bluff dice game — call your roll bracket.",
  howToPlay: "Schummeln (literally 'cheating') is a German open-bluff dice game where players roll five dice and announce whatever they please before exposure. This honest variant captures the call bracket. Across 12 rounds five dice are rolled. Predict: Triple or better (any face appearing 3+ times) pays +30, Two Pair (two distinct pairs, no triple) pays +22, High Sum (22 or more, no triple/two-pair) pays +15, Low (everything else) pays +8. Triple lands about 28% of five-dice rolls; two pair about 23%; high sum about 12%; low covers the remaining 37%. Wrong call scores zero. Strategy: triple-only averages roughly +100 across twelve rounds; mixing triple and two-pair picks averages +160 since their distribution is similar. Top score after twelve rounds wins. The German tavern original encouraged cheating bids; this variant rewards probability honesty. Five dice, four outcome bands, calibrate bets per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SchummelnBluffSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-schummeln-bluff-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-schummeln-bluff-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-schummeln-bluff-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-schummeln-bluff-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-schummeln-bluff-next"]', pulses: 3 };
  },
  component: SchummelnBluffGame,
};
