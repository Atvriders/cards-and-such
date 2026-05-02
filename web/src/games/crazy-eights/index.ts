import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CrazyEightsState, CrazyEightsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrazyEights } from "./CrazyEights.js";

export const crazyEightsSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "2" as const,
  },
  forcePlayAfterDraw: {
    kind: "boolean" as const,
    label: "Must play drawn card if legal",
    default: true,
  },
} as const;

export const crazyEightsPlugin: GamePlugin<
  CrazyEightsState,
  CrazyEightsAction,
  typeof crazyEightsSettings
> = {
  id: "crazy-eights",
  title: "Crazy Eights",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Match the top card by suit or rank. 8s are wild — declare the next suit.",
  howToPlay: `Race to empty your hand before the bots do. Match the top discard card by suit or by rank, or play an 8 as a wild card to change the active suit.

Matching: Play any card that shares the same suit or same rank as the top of the discard pile. For example, if the top card is a 7 of Hearts, you may play any Heart or any 7.

Eights (wild): An 8 may be played on any card. After playing an 8 you declare the new active suit — choose strategically based on your remaining hand.

Drawing: If you have no legal play, click Draw to take one card from the stock. If the drawn card is legal and the "Must play drawn card if legal" setting is on, it is played automatically; otherwise you choose whether to play it.

Scoring: The game ends when a player empties their hand. Points in remaining hands count against losers (Eights = 50, face cards = 10, others = face value). Your score is 100 minus your final penalty total.

Settings: Choose 1–3 opponents. Enable or disable the forced-play rule after drawing.

Tips: Hold 8s in reserve and play them to deny opponents their suit. If you have many cards of one suit, declare it after playing an 8. Watch how many cards bots hold — attack the leader with suit changes.`,
  settings: crazyEightsSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: CrazyEightsState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    const hand = state.hands[0] ?? [];
    const top = state.discardTop;
    const suit = state.activeSuit;
    // 1) Prefer a non-8 card matching suit or rank.
    const match = hand.find((c) => c.rank !== 8 && (c.suit === suit || c.rank === top.rank));
    if (match) return { selector: `[data-testid="hint-target-crazy-eights-${match.id}"]`, pulses: 3 };
    // 2) Else play an 8 (wild).
    const eight = hand.find((c) => c.rank === 8);
    if (eight) return { selector: `[data-testid="hint-target-crazy-eights-${eight.id}"]`, pulses: 3 };
    // 3) Otherwise pulse Draw or Pass.
    if (state.pendingDraw) {
      return { selector: '[data-testid="hint-target-crazy-eights-pass"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-crazy-eights-draw"]', pulses: 3 };
  },
  component: CrazyEights,
};
