import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaHiState, OmahaHiAction, OmahaHiSettings } from "./state.js";
import { initialState, reducer, isTerminal, bestOmaha } from "./state.js";
import { handStrength } from "../_shared/poker.js";
import { OmahaHiGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const omahaHiPlugin: GamePlugin<OmahaHiState, OmahaHiAction, typeof settings> = {
  id: "omaha-hi",
  title: "Omaha Hi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Omaha Hi vs CPU. 4 hole cards, 5 community, must use exactly 2 hole + 3 board.",
  howToPlay:
    "Omaha Hi is a community-card poker game like Texas Hold'em, but with a twist: you receive FOUR hole cards and must use EXACTLY two of them plus EXACTLY three community cards to make your final five-card hand.\n\nBetting rounds: pre-flop, flop (3 cards), turn (1), river (1), then showdown. Standard high-hand rankings apply.\n\nUse Fold/Check/Call/Raise. Use the slider to size your raise. Beat the CPU over 8 hands to maximize your stack.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OmahaHiSettings),
  reducer,
  isTerminal,
  hint: (state: OmahaHiState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "showdown" || (state.phase === "preflop" && state.player.hole.length === 0)) {
      return { selector: '[data-testid="hint-target-omaha-hi-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player") return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.2;
    if (state.community.length >= 3 && state.player.hole.length === 4) {
      strength = handStrength(bestOmaha(state.player.hole, state.community));
    } else if (state.player.hole.length === 4) {
      // Pre-flop heuristic.
      const ranks = state.player.hole.map((c) => (c.rank === 1 ? 14 : c.rank));
      const counts = new Map<number, number>();
      for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
      const hasPair = [...counts.values()].some((v) => v >= 2);
      const high = Math.max(...ranks);
      strength = 0.2 + (high - 2) / 30 + (hasPair ? 0.12 : 0);
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-omaha-hi-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-omaha-hi-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-omaha-hi-fold"]', pulses: 3 };
  },
  component: OmahaHiGame,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #0b3d2e, #1a6c3f)",
    accent: "rgba(74, 222, 128, 0.50)",
  },
};
