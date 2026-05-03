import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSpinPickState, CardSpinPickAction, CardSpinPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSpinPick } from "./Game.js";

const cardSpinPickSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["8", "12"] as const, default: "8" as const },
} as const;

type CardSpinPickSettingsType = SettingsOf<typeof cardSpinPickSettings>;

export const cardSpinPickPlugin: GamePlugin<CardSpinPickState, CardSpinPickAction, typeof cardSpinPickSettings> = {
  id: "card-spin-pick",
  title: "Card Spin Pick",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four face-down cards, one random spinner — pick your card and hope the spinner lands on yours for 100 points!",
  howToPlay: `Card Spin Pick is a luck-testing card game. Each round, four face-down cards are laid out numbered 1 to 4. You pick the one you want, then hit Spin to see which card the random spinner selects.

If the spinner lands on the card you picked, you score 100 points — a perfect match! If the spinner lands on a different card, you still score 10 consolation points.

After seeing the result, press Next to proceed to the next round with four fresh cards. The cards are revealed after spinning so you can see what was hiding under each position.

There is no skill-based advantage — each card has a 25% chance of being chosen by the spinner. The goal is simply to ride your luck and rack up matches over 8 or 12 rounds.

Can you match the spinner every single round? A perfect game scores 800 or 1,200 points depending on your chosen round count. Use Settings to choose how many rounds to play.`,
  settings: cardSpinPickSettings,
  initialState: (seed: number, settings: CardSpinPickSettingsType) => initialState(seed, settings as CardSpinPickSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "gameover") return null;
    if ((state as any).phase === "spun") return { selector: '[data-testid="hint-target-card-spin-pick-next"]', pulses: 3 };
    if ((state as any).playerPick === null) return { selector: '[data-testid="hint-target-card-spin-pick-pick"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-spin-pick-spin"]', pulses: 3 };
  },
  component: CardSpinPick,
};
