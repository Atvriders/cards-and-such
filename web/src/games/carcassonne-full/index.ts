import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  CarcassonneFullState,
  CarcassonneFullAction,
  CarcassonneFullSettings,
} from "./state.js";
import {
  initialState,
  reducer,
  isTerminal,
  allLegalPlacements,
} from "./state.js";

const CarcassonneFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.CarcassonneFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  cpu: {
    kind: "enum" as const,
    label: "CPU difficulty",
    options: ["greedy"] as const,
    default: "greedy" as const,
  },
} as const;

type S = SettingsOf<typeof settings>;

export const carcassonneFullPlugin: GamePlugin<
  CarcassonneFullState,
  CarcassonneFullAction,
  typeof settings
> = {
  id: "carcassonne-full",
  title: "Carcassonne (Full Base Game)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Tile-laying meeple deployment: build cities, roads, fields, and cloisters across a shared southern French countryside.",
  howToPlay:
    `Carcassonne (Full Base Game) is a 3-player tile-laying contest: you (Blue) versus CPU 1 (Red) and CPU 2 (Green). The 72-tile base set is shuffled and dealt from a shared bag. On your turn you draw the next tile, rotate it with the Rotate Left/Right buttons, then click any highlighted cell to drop it. A placement is legal only when every edge that touches an existing tile matches (city↔city, road↔road, field↔field).
` +
    `\n\nAfter placing the tile you may put one of your seven meeples on any feature of that tile — a Knight on a city wall, a Thief on a road, a Farmer in a field, or a Monk in the centre of a cloister — provided no meeple of any colour is already on that feature. You can also skip.
` +
    `\n\nFeatures score as soon as they finish: a completed city is worth 2 points per tile (3 per tile if it carries a shield), a completed road is 1 point per tile when both ends terminate, and a completed cloister is 9 points when fully surrounded by 8 tiles. Whoever has the most meeples on the feature collects the points and their meeples come home. The game ends when the bag is empty, and final scoring credits incomplete features at 1 point per tile (cloisters 1 + 1 per neighbour) plus 3 points for every completed city a Farmer borders.
` +
    `\n\nAdvanced rules omitted: rivers, expansions, two-meeple "large follower", and tie-breaks beyond "majority shares the full points". CPUs play greedily: they look one ply ahead, prefer placements that complete a feature this turn, target small features, and avoid sinking meeples into fields until the bag is nearly empty.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneFullSettings),
  reducer,
  isTerminal,
  hint: (state: CarcassonneFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "meeple") {
      // Suggest the skip button if no good option, else suggest first
      // meeple option button. We don't have visibility into "good"
      // options at this layer, so just pulse the skip button.
      return { selector: `[data-testid="cf-meeple-skip"]`, pulses: 3 };
    }
    if (state.phase === "place" && state.current) {
      // Find a legal placement and pulse its cell.
      const legals = allLegalPlacements(state, state.current);
      if (legals.length === 0) return null;
      const first = legals[0]!;
      return { selector: `[data-testid="cf-cell-${first.x}-${first.y}"]`, pulses: 3 };
    }
    return null;
  },
  component: CarcassonneFullGame,
};
