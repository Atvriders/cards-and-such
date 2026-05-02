import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrazyPineappleState, CrazyPineappleAction, CrazyPineappleSettings } from "./state.js";
import { initialState, reducer, isTerminal, bestFive } from "./state.js";
import { handStrength } from "../_shared/poker.js";
import { CrazyPineappleGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const crazyPineapplePlugin: GamePlugin<CrazyPineappleState, CrazyPineappleAction, typeof settings> = {
  id: "crazy-pineapple",
  title: "Crazy Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Crazy Pineapple: 3 hole cards, discard one AFTER the flop.",
  howToPlay:
    "Crazy Pineapple plays exactly like Pineapple — except you discard after seeing the flop instead of before. This creates wild post-flop decisions: you've got more information, but so does every play that comes after.\n\nDeal → preflop betting → flop → DISCARD → turn → river → showdown.\n\nUse Fold/Check/Call/Raise. Click a hole card after the flop to discard it.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrazyPineappleSettings),
  reducer,
  isTerminal,
  hint: (state: CrazyPineappleState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "showdown" || (state.phase === "preflop" && state.player.hole.length === 0)) {
      return { selector: '[data-testid="hint-target-crazypineap-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player" || state.pendingDiscard) return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.2;
    if (state.community.length >= 3 && state.player.hole.length >= 2) {
      strength = handStrength(bestFive([...state.player.hole, ...state.community]));
    } else if (state.player.hole.length >= 2) {
      const ranks = state.player.hole.map((c) => (c.rank === 1 ? 14 : c.rank));
      const counts = new Map<number, number>();
      for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
      const hasPair = [...counts.values()].some((v) => v >= 2);
      strength = 0.2 + (Math.max(...ranks) - 2) / 30 + (hasPair ? 0.15 : 0);
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-crazypineap-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-crazypineap-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-crazypineap-fold"]', pulses: 3 };
  },
  component: CrazyPineappleGame,
};
