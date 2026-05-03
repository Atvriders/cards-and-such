import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortyFivesState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FortyFives = /* @__PURE__ */ lazy(() => import("./FortyFives.js").then((mod) => ({ default: mod.FortyFives as unknown as React.ComponentType<unknown> })));
const fortyFivesSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type FortyFivesSettingsType = SettingsOf<typeof fortyFivesSettings>;

type FortyFivesAction = { type: "play"; cardId: string };

export const fortyFivesPlugin: GamePlugin<FortyFivesState, FortyFivesAction, typeof fortyFivesSettings> = {
  id: "forty-fives",
  title: "Forty-Fives",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ireland's national card game. Unique trump hierarchy — the 5 always beats the Jack!",
  howToPlay: `Forty-Fives is Ireland's most beloved card game, played at kitchens, pubs, and community halls across the country. It is a 4-player partnership game (you and Bot 2 vs Bot 1 and Bot 3).

Each player receives 5 cards. Trump is determined by a cut card. The first team to reach 45 points wins.

Unique Trump Order (highest to lowest): 5 of trump, Jack of trump, Ace of Hearts (always trump regardless of suit), Ace of trump, then K, Q, 10, 9, 8, 7, 6, 4, 3, 2. The 5 beating the Jack is the signature quirk of the game.

Following suit: You must follow the led suit if able. If trump is led, you must play trump if you have it.

Scoring: Each trick is worth 5 points. Win 5 tricks to score 25 points; your partner's tricks count with yours. First team to 45 wins.

Click a card to play it. Legal cards are highlighted.`,
  settings: fortyFivesSettings,
  initialState: (seed: number, settings: FortyFivesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-forty-fives-hand"]', pulses: 3 };
      return null;
    },
  component: FortyFives,
};
