import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HotelAcquisitionState, HotelAcquisitionAction, HotelAcquisitionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HotelAcquisitionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HotelAcquisitionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const hotelAcquisitionPlugin: GamePlugin<HotelAcquisitionState, HotelAcquisitionAction, typeof settings> = {
  id: "hotel-acquisition",
  title: "Hotel Acquisition",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hotel chain mergers — invest in chains before takeover.",
  howToPlay: "Hotel Acquisition is a hotel-chain merger distillation across ten turns. You start with $250 cash, no Hotel shares, and no Chain memberships. Each turn, pick one action: Buy a Hotel Share for $45, Save your cash for 5% interest, Join a Chain for $65, or Sell a Share for $35-55.\n\nAfter your action, every Share earns $9 in dividends and every Chain earns $13 in merger payouts. A merger flavor event reflects the boardroom drama. Your final score is net worth — cash plus cost-basis value of shares and chain memberships. The Acquire-style genre rewards smart timing; this version compresses the long-arc strategy into a tight ten-turn ride. Buy low, merge high, claim the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HotelAcquisitionSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-hotel-acquisition-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-hotel-acquisition-next"]', pulses: 3 };
    return null;
  },
  component: HotelAcquisitionGame,
};
