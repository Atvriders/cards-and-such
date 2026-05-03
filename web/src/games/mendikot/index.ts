import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MendikotState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Mendikot = /* @__PURE__ */ lazy(() => import("./Mendikot.js").then((mod) => ({ default: mod.Mendikot as unknown as React.ComponentType<unknown> })));
const mendikotSettings = {} as const;
type MendikotSettings = SettingsOf<typeof mendikotSettings>;
type MendikotAction = { type: "play"; cardId: string };

export const mendikotPlugin: GamePlugin<MendikotState, MendikotAction, typeof mendikotSettings> = {
  id: "mendikot",
  title: "Mendikot",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian partnership trump game on 52 cards — 1v1 duel.",
  howToPlay: `Mendikot is an Indian partnership trick-taking game played with a standard 52-card deck. The team that captures the most tens wins. This simplified 1v1 duel preserves the trick-play core with spades as trump. You and the bot each receive 13 cards. Each trick: follow the led suit if able, otherwise play any card including trump. Highest spade wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Mendikot, capturing the four tens (especially 10♠) is the goal. This duel simplifies to pure trick play. Lead long side suits early to flush spades, then cash your trumps and side-suit aces. Score is tricks taken — capture 7 of 13 tricks to win the round.`,
  settings: mendikotSettings,
  initialState: (seed: number, _settings: MendikotSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-mendikot-hand"]', pulses: 3 };
      return null;
    },
  component: Mendikot,
};
