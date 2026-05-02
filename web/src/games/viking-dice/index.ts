import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VikingDiceState, VikingDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VikingDice } from "./VikingDice.js";

export const vikingDiceSettings = {
  target: {
    kind: "enum" as const,
    label: "Raid Target",
    options: ["50", "100", "150"] as const,
    default: "100",
  },
} as const;

type VikingDiceSettingsType = SettingsOf<typeof vikingDiceSettings>;

export const vikingDicePlugin: GamePlugin<VikingDiceState, VikingDiceAction, typeof vikingDiceSettings> = {
  id: "viking-dice",
  title: "Viking Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Press your luck raiding with dice — axes earn loot, shields block skulls, but three skulls end your turn!",
  howToPlay: `Viking Dice is a Norse-themed press-your-luck game. Your goal is to accumulate enough raid points to reach the target (50, 100, or 150) in as few turns as possible.

Each turn you roll six dice. Every die shows one of three faces: Axe (1–2), Shield (5–6), or Skull (3–4). Axes earn 10 raid points each. Shields cancel out skulls — each shield you've rolled this turn protects against one skull. If your accumulated skulls exceed your accumulated shields by 3 or more, you BUST and lose all raid points earned this turn.

After each roll you choose: press your luck and roll again (earning more axes but risking more skulls), or bank your current turn raid points safely. Banked points carry over between turns; busted turns score nothing.

Shields and skulls accumulate across rolls within a turn — so an early shield haul gives you more safety on follow-up rolls. Aim for the target in as few turns as possible: your final score is 1000 minus 10 per turn taken. Efficiency wins!`,
  settings: vikingDiceSettings,
  initialState: (seed: number, settings: VikingDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).won) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-viking-dice-nextTurn"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-viking-dice-roll"]', pulses: 3 };
  },
  component: VikingDice,
};
