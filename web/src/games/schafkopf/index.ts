import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SchafkopfState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Schafkopf } from "./Schafkopf.js";

const schafkopfSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type SchafkopfSettingsType = SettingsOf<typeof schafkopfSettings>;

type SchafkopfAction = { type: "play"; cardId: string };

export const schafkopfPlugin: GamePlugin<SchafkopfState, SchafkopfAction, typeof schafkopfSettings> = {
  id: "schafkopf",
  title: "Schafkopf",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bavarian trump-taking game with Queens and Jacks as permanent trumps.",
  howToPlay: `Schafkopf (literally "sheepshead") is the national card game of Bavaria, played with a 32-card deck (7 through Ace in each suit). This version pits you against three bots.

Trump cards: All four Queens (Obers) rank highest, followed by all four Jacks (Unters), then the entire Hearts suit. Queens rank ♣ > ♠ > ♥ > ♦, and Jacks rank the same. This means Queens and Jacks are trump regardless of their suit.

Non-trump suits follow Ace > 10 > King > 9 > 8 > 7.

Card points: Ace = 11, Ten = 10, King = 4, Queen = 3, Jack = 2, others = 0. Total in the deck is 120 points.

Play: Each trick is led by the winner of the previous trick (you lead first). You must follow the led suit if possible; if the led suit is trump, you must follow trump. If you cannot follow, you may play anything.

Winning: You win the hand by collecting more card-points than the combined bots (more than 60 out of 120). The bots cooperate against you.

Click a card to play it. Legal cards are highlighted.`,
  settings: schafkopfSettings,
  initialState: (seed: number, settings: SchafkopfSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-schafkopf-hand"]', pulses: 3 };
      return null;
    },
  component: Schafkopf,
};
