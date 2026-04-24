import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MississippiStudState, MississippiStudAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MississippiStudGame } from "./Game.js";

export const mississippiStudSettings = {
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
  hands: {
    kind: "enum" as const,
    label: "Hands per Session",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
} as const;

type Settings = SettingsOf<typeof mississippiStudSettings>;

export const mississippiStudPlugin: GamePlugin<MississippiStudState, MississippiStudAction, typeof mississippiStudSettings> = {
  id: "mississippi-stud",
  title: "Mississippi Stud",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-card stud variant. Ante then raise 1–3× on each of three streets. Pay table on final hand.",
  howToPlay: `Mississippi Stud is a five-card stud poker variant where you play against a pay table rather than against the dealer. Your goal is to make the best five-card hand from your two hole cards and three community cards.

Flow: Pay an ante, receive two hole cards. Three community cards are dealt face-down. Over three streets — 3rd, 4th, and 5th — one community card is revealed at a time. Before each reveal you must either Fold (lose all bets so far) or Bet 1×, 2×, or 3× the original ante.

Final hand: After the 5th street bet, all five cards are evaluated. You must have a pair of 6s or better to win. Pay table (on total amount wagered): Pair of 6s through Kings → 1:1, Two Pair → 2:1, Three of a Kind → 3:1, Straight → 4:1, Flush → 6:1, Full House → 10:1, Four of a Kind → 40:1, Straight Flush → 100:1. Pair of 2s through 5s and high-card hands lose.

Strategy: Always continue with a pair. With three-to-a-flush or three-to-a-straight after the flop, consider betting 3× on 4th street. Fold low unsuited unpaired holdings early — the progressive bet structure means losses compound quickly.`,
  settings: mississippiStudSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MississippiStudGame,
};
