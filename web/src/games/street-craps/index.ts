import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StreetCrapsState, StreetCrapsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StreetCraps } from "./StreetCraps.js";

export const streetCrapsSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
} as const;

type StreetCrapsSettingsType = SettingsOf<typeof streetCrapsSettings>;

export const streetCrapsPlugin: GamePlugin<StreetCrapsState, StreetCrapsAction, typeof streetCrapsSettings> = {
  id: "street-craps",
  title: "Street Craps",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice on the come-out — hit 7 or 11 to win instantly, or set a point and roll again!",
  howToPlay: `Street Craps (also called shooting dice or street dice) is the simplified version of casino craps played anywhere with just two dice.

Each round begins with a come-out roll. If you roll 7 or 11 — a natural — you win immediately. If you roll 2, 3, or 12 — craps — you lose. Any other result (4, 5, 6, 8, 9, or 10) becomes your "point."

Once a point is set, keep rolling. If you hit your point again before rolling a 7, you win. If you roll a 7 first, you lose — this is called "sevening out." Any other roll and you just keep going.

Your score reflects your win rate across all rounds. Higher is better — a perfect game wins all rounds. The natural probability of winning any given round is about 49.3%, so consistent wins require luck.

Tips: lower points (4 and 10) have fewer ways to hit than higher ones (6 and 8). There is no strategy once the point is set — it is pure dice probability. Watch your roll history to see how fortune ebbs and flows.`,
  settings: streetCrapsSettings,
  initialState: (seed: number, settings: StreetCrapsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-street-craps-nextRound"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-street-craps-roll"]', pulses: 3 };
  },
  component: StreetCraps,
};
