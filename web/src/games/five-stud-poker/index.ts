import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveStudPokerState, FiveStudPokerAction, FiveStudPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal, bestFiveStud } from "./state.js";
import { handStrength } from "../_shared/poker.js";
import { FiveStudPokerGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  ante: { kind: "enum" as const, label: "Ante", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const fiveStudPokerPlugin: GamePlugin<FiveStudPokerState, FiveStudPokerAction, typeof settings> = {
  id: "five-stud-poker",
  title: "5-Card Stud",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up 5-Card Stud: 1 down + 4 up cards dealt over 4 streets with betting between.",
  howToPlay:
    "5-Card Stud is the original stud poker game. Each player gets one face-down card and a face-up card to start, then receives an additional face-up card on each of three subsequent streets — five cards total.\n\nBetting occurs after each deal. The CPU's hole card stays hidden until showdown; everything else is visible. Best 5-card poker hand wins.\n\nUse Fold/Check/Call/Raise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FiveStudPokerSettings),
  reducer,
  isTerminal,
  hint: (state: FiveStudPokerState): HintTarget | null => {
    if (state.done) return null;
    if (state.street === 0) {
      return { selector: '[data-testid="hint-target-fivestud-deal"]', pulses: 3 };
    }
    if (state.toAct !== "player") return null;
    const toCall = Math.max(0, state.cpu.bet - state.player.bet);
    let strength = 0.25;
    if (state.player.cards.length >= 5) {
      strength = handStrength(bestFiveStud(state.player.cards));
    } else if (state.player.cards.length >= 2) {
      const ranks = state.player.cards.map((c) => (c.rank === 1 ? 14 : c.rank));
      const counts = new Map<number, number>();
      for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
      const mx = Math.max(0, ...counts.values());
      strength = mx >= 3 ? 0.6 : mx === 2 ? 0.4 : 0.2 + (Math.max(...ranks) - 2) / 50;
    }
    if (toCall === 0) return { selector: '[data-testid="hint-target-fivestud-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-fivestud-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-fivestud-fold"]', pulses: 3 };
  },
  component: FiveStudPokerGame,
};
