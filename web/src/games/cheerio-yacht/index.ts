import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheerioYachtState, CheerioYachtAction, CheerioYachtSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheerioYachtGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cheerioYachtPlugin: GamePlugin<CheerioYachtState, CheerioYachtAction, typeof settings> = {
  id: "cheerio-yacht",
  title: "Cheerio Yacht",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-dice push categories — pick the matching score band each round across 12 turns.",
  howToPlay: "Cheerio Yacht is a streamlined cousin of Yacht and Cheerio that runs over 12 short rounds. Each round two six-sided dice are rolled and you must call which scoring category matches the result before you see it: a Pair (both dice equal), a Run (consecutive values like 3-4 or 5-6), or a Mixed roll (everything else).\n\nYou click one of the three calls. The dice roll, the result is classified, and if your call matches the result you bank that round's score: Pair pays 30, Run pays 25, Mixed pays 10. A wrong call scores zero.\n\nThe game tests your read of dice probabilities. There are 6 pair outcomes (16.7%), 10 run outcomes (27.8%), and 20 mixed outcomes (55.5%) across the 36 equally-likely rolls. Calling Mixed feels safe but pays the least; calling Pair is risky but pays best. Twelve rounds, top score wins. Average expected score sits near 130 points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CheerioYachtSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-cheerio-yacht-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-cheerio-yacht-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-cheerio-yacht-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-cheerio-yacht-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-cheerio-yacht-next"]', pulses: 3 };
  },
  component: CheerioYachtGame,
};
