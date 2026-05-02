import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeTwoOneDownState, ThreeTwoOneDownAction, ThreeTwoOneDownSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeTwoOneDownGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const threeTwoOneDownPlugin: GamePlugin<ThreeTwoOneDownState, ThreeTwoOneDownAction, typeof settings> = {
  id: "three-two-one-down",
  title: "3-2-1 Countdown",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3-2-1 on three dice — exact-order or any-order.",
  howToPlay: "3-2-1 Countdown is a focused dice variant where players roll three dice and chase the descending triplet 3-2-1. Across 10 rounds three dice are rolled. Predict: 3-2-1 in exact display order (die1=3, die2=2, die3=1) pays +50, Any 3-2-1 set (the dice show {1,2,3} in any positional order) pays +25, No 3-2-1 (the roll lacks one of those values) pays +5. The exact-order combo lands about 0.46% of rolls — once in 216 — so the +50 covers the long wait. Any-order 1-2-3 hits 6/216 = 2.78%. The fall-through 'no 3-2-1' covers about 96.8% of rolls and pays a small consolation. Wrong call scores zero. Strategy: always-No-3-2-1 is steady around +50 across ten rounds; daring exact-order calls only pay if luck cooperates. The novelty is recognizing how rare ordered combinations are. Ten rounds, top score wins. Best played with a quick scorepad.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeTwoOneDownSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-three-two-one-down-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-three-two-one-down-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-three-two-one-down-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-three-two-one-down-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-three-two-one-down-next"]', pulses: 3 };
  },
  component: ThreeTwoOneDownGame,
};
