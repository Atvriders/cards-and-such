import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PitchCardState, PitchCardAction, PitchCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PitchCardGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pitchCardPlugin: GamePlugin<PitchCardState, PitchCardAction, typeof settings> = {
  id: "pitch-card", title: "Pitch", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partnership auction trick game where high-bid pitches trump.",
  howToPlay: "Pitch (also Auction Pitch or Setback) is a classic American partnership trick-taking game played with a fifty-two-card deck. Each player receives six cards, and players bid one through four points; the high bidder pitches the lead and declares the trump suit. Points are scored for capturing the high trump, low trump, jack of trump, and the ten of trump (game). The bid wins or loses the round in full — make your bid and score those points, fail and they go to opponents. In this one-on-one CPU duel across six rounds, click Play Round to bid and play. Strategy: bid only when holding the ace, king, or queen of a suit — these guarantee high. Bid four (Smudge) only on a hand with both jack and ten of intended trump. Aim for at least four made bids across the match. A score above ten is a respectable Pitch result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PitchCardSettings),
  reducer, isTerminal, component: PitchCardGame,
};
