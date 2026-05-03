import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParksTrailState, ParksTrailAction, ParksTrailSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ParksTrailGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const parksTrailPlugin: GamePlugin<ParksTrailState, ParksTrailAction, typeof settings> = {
  id: "parks-trail",
  title: "Parks Trail",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hike trail card collection — camp and hike collecting memories and wildlife.",
  howToPlay: "Parks Trail condenses the national parks hiking card game into ten quick turns. Begin with $200 cash, no Memory cards, and no Camp upgrades. Each turn, pick one action: Buy a Memory Card for $35, Save your cash for 5% interest, Buy a Camp Upgrade for $55, or Sell a Memory back to the album for a $25-45 payout. After your action, every Memory earns $7 from photo licensing and every Camp earns $11 from hostel bookings.\n\nA wildlife event flavors each round. Your final score is your net worth — cash plus the cost-basis value of your memories and camps. Memory cards yield steady income but tie up capital; camps amplify earnings but cost more; saving is slow but safe. Aim for a balanced trail collection by turn 10 and complete every park. Hike on.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ParksTrailSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-parks-trail-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-parks-trail-next"]', pulses: 3 };
    return null;
  },
  component: ParksTrailGame,
};
