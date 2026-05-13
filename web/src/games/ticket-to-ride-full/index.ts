import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TTRState, TTRAction, TTRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const TicketToRideFull = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({
  default: mod.TicketToRideFullGame as unknown as React.ComponentType<unknown>,
})));

const settings = {
  cpuAggression: {
    kind: "number" as const,
    label: "CPU aggression (0=mild, 2=ruthless)",
    min: 0,
    max: 2,
    step: 1,
    default: 1,
  },
} as const;

export const ticketToRideFullPlugin: GamePlugin<TTRState, TTRAction, typeof settings> = {
  id: "ticket-to-ride-full",
  title: "Ticket to Ride (USA Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build your rail empire across 30 US cities, claim routes by spending colored cards, complete destination tickets for bonus points.",
  howToPlay: `Ticket to Ride: USA Full — you race two CPU rivals (Red and Blue) to build the most valuable rail network across 30 US/Canadian cities.

Each player starts with 45 train pieces, 4 train cards, and 3 destination tickets (you must keep at least 2). On your turn pick exactly one action:

  1. Draw 2 train cards. Either take from the 5 face-up market or the deck. A face-up Locomotive counts as your entire turn (only 1 card drawn).

  2. Claim a route. Spend N cards of the route's color (Locomotives are wild) and place N trains. Scoring per length: 1=1pt, 2=2pts, 3=4pts, 4=7pts, 5=10pts, 6=15pts. Gray routes accept any one color (pick from your hand).

  3. Draw 3 destination tickets. Keep at least 1; discard the rest.

The game ends the round any player drops to 2 or fewer trains: every remaining player gets one final turn. Final scoring adds route points + completed-ticket values, subtracts uncompleted-ticket penalties, and awards +10 for the player(s) with the longest continuous route.

Map note: this is a 30-city representative subset of the classic USA map. Omitted cities include Charleston, Pittsburgh, Sault Ste. Marie, and a few others; routes have been re-curated to give a balanced, fully-playable network.

CPU strategy: Red and Blue each compute a shortest-route path for every ticket and greedily claim the first ticket-path route they can afford. If they can't claim anything, they draw cards toward the color their next ticket route needs. They auto-draw new tickets when their position is comfortable.

Advanced rules omitted (L tier): parallel double-routes, Globetrotter bonus (most completed tickets), 1910 expansion ticket deck, and the "three locomotives face-up triggers wipe" rule.`,
  settings,
  initialState: (seed: number, s: TTRSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "ticket" && state.current === 0) {
      return { selector: '[data-testid="ttr-commit-tickets"]', pulses: 3 };
    }
    if (state.phase === "play" && state.current === 0) {
      // Suggest drawing from the deck as a safe default.
      return { selector: '[data-testid="ttr-draw-deck"]', pulses: 3 };
    }
    if (state.phase === "drawing" && state.current === 0) {
      return { selector: '[data-testid="ttr-draw-deck"]', pulses: 3 };
    }
    return null;
  },
  component: TicketToRideFull,
};
