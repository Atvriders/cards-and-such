import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTowerStackState, DiceTowerStackAction, DiceTowerStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTowerStackGame } from "./Game.js";

export const diceTowerStackSettings = {
  diceSides: {
    kind: "enum" as const,
    label: "Dice sides",
    options: ["6", "8", "10"] as const,
    default: "6" as const,
  },
} as const;

type DTSSettingsType = SettingsOf<typeof diceTowerStackSettings>;

function coerce(s: DTSSettingsType): DiceTowerStackSettings {
  return { diceSides: (parseInt(s.diceSides, 10) as 6 | 8 | 10) };
}

export const diceTowerStackPlugin: GamePlugin<
  DiceTowerStackState,
  DiceTowerStackAction,
  typeof diceTowerStackSettings
> = {
  id: "dice-tower-stack",
  title: "Dice Tower Stack",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Roll 5 dice, stack them with strictly ascending values in roll order. 10 rounds, +20 bonus per perfect ascending tower.",
  howToPlay:
    "Each round you roll 5 dice. Click dice in roll order to add them to your tower; each subsequent die you click must show a strictly higher value than the one beneath it.\n\nClick a stacked die to remove it (and any dice above it). Once you are satisfied, press Commit Stack — your stack score is the sum of the chosen dice. If all 5 dice form a strictly ascending sequence in roll order you receive a +20 perfect bonus.\n\nThe game runs for 10 rounds and your final score is the total of all rounds plus all perfect bonuses.",
  settings: diceTowerStackSettings,
  initialState: (seed: number, s: DTSSettingsType) => initialState(seed, coerce(s)),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolled") return { selector: '[data-testid="hint-target-dice-tower-stack-select"]', pulses: 3 };
    if (phase === "picking") return { selector: '[data-testid="hint-target-dice-tower-stack-select"]', pulses: 3 };
    if (phase === "selecting") return { selector: '[data-testid="hint-target-dice-tower-stack-select"]', pulses: 3 };
    if (phase === "choosing") return { selector: '[data-testid="hint-target-dice-tower-stack-select"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-tower-stack-next"]', pulses: 3 };
  },
  component: DiceTowerStackGame,
};
