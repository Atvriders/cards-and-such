import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SedmaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Sedma = /* @__PURE__ */ lazy(() => import("./Sedma.js").then((mod) => ({ default: mod.Sedma as unknown as React.ComponentType<unknown> })));
const sedmaSettings = {} as const;
type SedmaSettings = SettingsOf<typeof sedmaSettings>;
type SedmaAction = { type: "play"; cardId: string };

export const sedmaPlugin: GamePlugin<SedmaState, SedmaAction, typeof sedmaSettings> = {
  id: "sedma",
  title: "Sedma",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Czech 7-takes-all capture game — simplified head-to-head trick duel.",
  howToPlay: `Sedma is a Czech and Slovak capture game where the 7 of any suit takes any trick — hence the name (sedma means seven). This simplified 1v1 duel uses a stripped 32-card deck (7, 8, 9, 10, J, Q, K, A in each suit). There is no trump suit. Each trick: follow the led suit if able, otherwise play any card. Highest card of the led suit wins. Click cards to play. Trick winner leads next. Strategy: in true Sedma, a 7 played to a trick captures it regardless of led suit — a quirk this simplified version omits in favor of straight high-card play. Save your aces and tens (worth points in real Sedma) for tricks you can win. Score is tricks taken — capture 5 of 8 tricks to win the round.`,
  settings: sedmaSettings,
  initialState: (seed: number, _settings: SedmaSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-sedma-hand"]', pulses: 3 };
      return null;
    },
  component: Sedma,
};
