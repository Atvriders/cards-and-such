import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GlucksradState, GlucksradAction, GlucksradSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GlucksradGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const glucksradPlugin: GamePlugin<GlucksradState, GlucksradAction, typeof settings> = {
  id: "glucksrad",
  title: "Glucksrad Wheel",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Medieval German 'house of fortune' two-dice betting.",
  howToPlay: "Glucksrad, the medieval German 'wheel of fortune' or 'lucky house', was a tavern betting game where players placed coins on numbered houses and rolled two dice to win the matching house's pot. This variant maps that to three sum-bands. Across 10 rounds two dice are rolled. Bet the band: Wheel A (sums 2-5) pays +25, Wheel B (sums 6-8) pays +10, Wheel C (sums 9-12) pays +25. The middle band (6,7,8) holds about 44% of outcomes — high frequency, low payout. Each edge band is around 28% — lower frequency, higher payout to compensate. Wrong call scores zero. Strategy: the modal sum is 7 (16.7%) so always-Wheel-B yields steady +100 over ten rounds, while edge calling can hit +175 if the dice cooperate. Ten rounds, top score wins. The original Glucksrad with its painted houses survived in German Christmas markets into the 19th century.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GlucksradSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-glucksrad-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-glucksrad-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-glucksrad-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-glucksrad-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-glucksrad-next"]', pulses: 3 };
  },
  component: GlucksradGame,
};
