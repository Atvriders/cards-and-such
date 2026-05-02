import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiaState, MiaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mia } from "./Mia.js";

export const miaSettings = {
  startingLives: {
    kind: "enum" as const,
    label: "Starting Lives",
    options: ["3", "5"] as const,
    default: "3",
  },
} as const;

type MiaSettingsType = SettingsOf<typeof miaSettings>;

export const miaPlugin: GamePlugin<MiaState, MiaAction, typeof miaSettings> = {
  id: "mia",
  title: "Mia",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bluffing dice game. Roll 2 dice secretly, then declare your result — truthfully or as a bluff. The bot decides to believe you or challenge. Lies and truths both have consequences.",
  howToPlay: `Mia is a bluffing game played with 2 dice. Each player starts with 3 lives (or 5 in extended mode). Lose all your lives and you're out.

Each round: click "Roll Dice" to roll 2 dice secretly — only you see the result. Then pick a claim from the dropdown: declare your actual roll, or bluff with something higher. The bot then decides whether to believe you or challenge you.

If the bot challenges you: if your actual roll meets or beats your claimed rank, the bot was wrong and loses a life. If you bluffed (claimed higher than you rolled), you lose a life.

If the bot believes you: it rolls its own two dice. If the bot's roll beats your declared claim, you lose a life. If the bot can't beat your claim, the bot loses a life.

Roll ranking from lowest to highest: 3-1, 3-2, 4-1, 4-2, 4-3, 5-1, 5-2, 5-3, 5-4, 6-1, 6-2, 6-3, 6-4, 6-5, then doubles 1-1 through 6-6, and finally Mia (2-1) — the highest possible roll. Mia beats everything.

Strategy: bluff aggressively when you roll low — but be consistent, since the bot learns. Calling Mia is a powerful bluff that the bot will almost always challenge.`,
  settings: miaSettings,
  initialState: (seed: number, settings: MiaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mia-roll"]', pulses: 3 };
  },
  component: Mia,
};
