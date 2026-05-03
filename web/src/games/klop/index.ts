import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlopState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Klop = /* @__PURE__ */ lazy(() => import("./Klop.js").then((mod) => ({ default: mod.Klop as unknown as React.ComponentType<unknown> })));
const klopSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type KlopSettingsType = SettingsOf<typeof klopSettings>;
type KlopAction = { type: "play"; cardId: string };

export const klopPlugin: GamePlugin<KlopState, KlopAction, typeof klopSettings> = {
  id: "klop",
  title: "Klop",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slovenian misère trick-taking game — avoid winning tricks to avoid penalty points.",
  howToPlay: `Klop is a popular Slovenian card game and a variant of Negative Tarock. The goal is the opposite of most trick-taking games: you want to avoid winning tricks, because each trick you take costs you penalty points.

Setup: Four players are each dealt 8 cards from the 52-card deck. There is no trump suit — the highest card of the led suit always wins.

Play: You lead the first trick. Players must follow the led suit if possible; if unable, they may play any card. The highest card of the led suit wins the trick. The winner of each trick leads the next.

Scoring: Each trick you win earns you 1 penalty point. Penalty is bad — the player with the fewest tricks wins. Special rule (Klop): if one player takes all 8 tricks, they score 0 and all other players receive 8 penalty points instead.

Strategy: Lead your low cards to force others to win tricks. When following suit, play your highest card just below the winning card to avoid taking over. Save off-suit cards to discard when you can't follow.

Click cards to play. You must follow the led suit — legal plays are highlighted.`,
  settings: klopSettings,
  initialState: (seed: number, settings: KlopSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-klop-hand"]', pulses: 3 };
      return null;
    },
  component: Klop,
};
