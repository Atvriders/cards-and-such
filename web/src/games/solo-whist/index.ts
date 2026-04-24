import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoloWhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoloWhist } from "./SoloWhist.js";

const soloWhistSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type SoloWhistSettingsType = SettingsOf<typeof soloWhistSettings>;

type SoloWhistAction =
  | { type: "bid"; bid: "pass" | "solo" | "misere" | "abundance" }
  | { type: "play"; cardId: string };

export const soloWhistPlugin: GamePlugin<SoloWhistState, SoloWhistAction, typeof soloWhistSettings> = {
  id: "solo-whist",
  title: "Solo Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British 4-player bidding game where you play solo against three opponents.",
  howToPlay: `Solo Whist is a British card game in which each player bids to play alone against three opponents. It has been a pub favourite for over a century.

Each player receives 13 cards from a standard 52-card deck. A trump suit is determined. You must make a bid before play:

Solo: You undertake to win at least 5 of the 13 tricks alone against the three bots. The bots cooperate against you.

Misere: You undertake to win zero tricks. The bots try to force you to win one.

Abundance: You name trump and undertake to win at least 9 tricks — a very bold bid!

Pass: You concede and the bots score a point.

Play: You lead first. Players must follow the led suit if able. The highest trump wins; if no trump is played, the highest card of the led suit wins.

Click a bid button, then click cards to play. Legal cards are highlighted.`,
  settings: soloWhistSettings,
  initialState: (seed: number, settings: SoloWhistSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SoloWhist,
};
