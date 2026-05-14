import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CKState, CKAction, CKSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const CitiesKnights = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({
  default: mod.CatanCitiesKnightsGame as unknown as React.ComponentType<unknown>,
})));

const settings = {
  vpTarget: {
    kind: "number" as const,
    label: "Victory Points to Win",
    min: 10,
    max: 15,
    step: 1,
    default: 13,
  },
} as const;

export const catanCitiesKnightsPlugin: GamePlugin<CKState, CKAction, typeof settings> = {
  id: "catan-cities-knights",
  title: "Catan: Cities & Knights",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Defend Catan against the barbarian invasion with commodities, knights, walls, and progress cards. First to 13 VP wins.",
  howToPlay: `Cities & Knights is the deluxe Catan expansion. You play against 3 CPU rivals on the standard 19-hex board and race to 13 victory points.

In addition to base Catan resources (Wood, Brick, Sheep, Wheat, Ore) you collect three COMMODITIES:
  - Paper from cities on FOREST (wood) tiles
  - Cloth from cities on PASTURE (sheep) tiles
  - Coin from cities on MOUNTAIN (ore) tiles

A city placed on a commodity-producing tile yields 1 resource + 1 commodity per matching roll (instead of the usual 2 resources). Cities on Brick / Wheat tiles still yield 2 resources.

Costs (Resources):
  - Road: 1 Wood + 1 Brick
  - Settlement: 1 Wood + 1 Brick + 1 Sheep + 1 Wheat (1 VP)
  - City: 2 Wheat + 3 Ore (2 VP)
  - City Wall: 2 Brick (absorbs 1 barbarian sack)
  - Recruit Basic Knight: 1 Sheep + 1 Ore
  - Promote Knight: 1 Sheep + 1 Ore (basic → strong → mighty)
  - Activate Knight: 1 Wheat (inactive knights cannot fight barbarians)
  - Progress Card: 1 Wheat + 1 matching Commodity (Science=Paper, Politics=Coin, Trade=Cloth)

THE BARBARIAN SHIP advances one space at the end of every full round (and on each 7 rolled). On the 7th tick the barbarians arrive. Their strength equals the total number of cities on the board. If TOTAL ACTIVE KNIGHT STRENGTH across all players is greater than or equal to barbarian strength, the barbarians are repelled and the player with the most active knight strength gains +1 VP (Defender of Catan). Otherwise, the player with the weakest active-knight force loses their weakest city (a city wall absorbs the hit if present). All knights deactivate after the assault.

Win condition: 13 VP (configurable). VP comes from settlements (1), cities (2), Defender awards, and special VP progress cards.

CPU strategy: greedy build cities then activate / promote knights to threaten the Defender award and avoid sackings.

Advanced rules omitted (XL tier): full progress card effects (each card grants a generic small bonus rather than the named effect), specific knight chase / displacement / robber actions, metropolis upgrades (city improvement tracks), ports, and player-to-player trading.`,
  settings,
  initialState: (seed: number, s: CKSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "setup" && state.current === 0) {
      if (state.setupSubPhase === "place_settlement") {
        return { selector: '[data-testid="ck-vertex-best"]', pulses: 3 };
      }
      if (state.setupSubPhase === "place_road") {
        return { selector: '[data-testid="ck-edge-best"]', pulses: 3 };
      }
    }
    if (state.phase === "roll" && state.current === 0) {
      return { selector: '[data-testid="ck-roll"]', pulses: 3 };
    }
    if (state.phase === "play" && state.current === 0) {
      return { selector: '[data-testid="ck-end-turn"]', pulses: 3 };
    }
    if (state.phase === "cpu") {
      return { selector: '[data-testid="ck-cpu-tick"]', pulses: 3 };
    }
    return null;
  },
  component: CitiesKnights,
};
