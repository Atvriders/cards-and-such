import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MirrorSpadesState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MirrorSpades = /* @__PURE__ */ lazy(() => import("./MirrorSpades.js").then((mod) => ({ default: mod.MirrorSpades as unknown as React.ComponentType<unknown> })));
const mirrorSpadesSettings = {} as const;
type MirrorSpadesSettings = SettingsOf<typeof mirrorSpadesSettings>;
type MirrorSpadesAction = { type: "play"; cardId: string };

export const mirrorSpadesPlugin: GamePlugin<MirrorSpadesState, MirrorSpadesAction, typeof mirrorSpadesSettings> = {
  id: "mirror-spades",
  title: "Mirror Spades",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spades where your bid equals your spade count and you must hit it.",
  howToPlay: `Mirror Spades is a Spades variant where each player must bid the exact number of spade cards in their hand. There is no choice: the count is the bid. Spades are trump. In this duel, you and the bot each receive 13 cards. The number of spades you start with is your bid, displayed each game. Then you play 13 tricks following standard rules: follow the led suit if able, otherwise play any card. Highest spade wins; if no spade, highest of the led suit wins. Click cards to play. Strategy: don’t take more tricks than your spade count or you bag. To win the round, take a number of tricks at least equal to your bid — careful plays of side-suit aces and ducks let you control how many tricks you grab.`,
  settings: mirrorSpadesSettings,
  initialState: (seed: number, _settings: MirrorSpadesSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-mirror-spades-hand"]', pulses: 3 };
      return null;
    },
  component: MirrorSpades,
};
