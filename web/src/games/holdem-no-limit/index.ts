import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { HoldemNoLimitState, HoldemNoLimitAction, HoldemNoLimitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HoldemNoLimitGame } from "./Game.js";

const settings = {
  startingStack: {
    kind: "enum" as const,
    label: "Starting Stack",
    options: ["500", "1000", "2000"] as const,
    default: "1000",
  },
  blinds: {
    kind: "enum" as const,
    label: "Blinds",
    options: ["5/10", "10/20", "25/50"] as const,
    default: "10/20",
  },
} as const;

type S = SettingsOf<typeof settings>;

export const holdemNoLimitPlugin: GamePlugin<HoldemNoLimitState, HoldemNoLimitAction, typeof settings> = {
  id: "holdem-no-limit",
  title: "Hold'em No-Limit",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Heads-up Texas Hold'em No-Limit vs CPU. Two hole cards, five community cards (flop, turn, river), unlimited bet sizing, showdown for the pot.",
  howToPlay:
    "Real Texas Hold'em No-Limit, you vs the CPU. Each hand: blinds are posted (small / big), each player is dealt two hole cards, and four betting rounds follow — pre-flop, flop (3 community cards), turn (1 more), river (1 more).\n\nOn each turn you can FOLD, CHECK (when no bet is owed), CALL the outstanding bet, or RAISE — the slider lets you size any amount from the legal minimum up to your full stack (all-in). The CPU uses Monte-Carlo equity estimation: weak hands fold, marginal ones call, strong ones raise — with a touch of randomness so it's not robotic.\n\nAt showdown the best 5-card hand from each player's 7 cards (2 hole + 5 community) wins the pot. If your opponent folds, you scoop the pot uncalled. The button alternates each hand. The match ends when one stack hits zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HoldemNoLimitSettings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-holdem-no-limit-primary"]', pulses: 3 }),
  component: HoldemNoLimitGame,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #0b3d2e, #1a6c3f)",
    accent: "rgba(74, 222, 128, 0.50)",
  },
};
