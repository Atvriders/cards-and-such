import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { WingspanFullState, WingspanFullAction, WingspanFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const WingspanFull = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({
  default: mod.WingspanFullGame as unknown as React.ComponentType<unknown>,
})));

const settings = {
  cpuCount: {
    kind: "number" as const,
    label: "CPU Opponents",
    min: 1,
    max: 2,
    step: 1,
    default: 2,
  },
} as const;

export const wingspanFullPlugin: GamePlugin<WingspanFullState, WingspanFullAction, typeof settings> = {
  id: "wingspan-full",
  title: "Wingspan (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Engine-building game of birds: gain food, lay eggs, and play bird cards across three habitats over four rounds.",
  howToPlay: `Wingspan is an engine-builder about attracting birds to your wildlife preserve. You play against 1 or 2 CPU rivals across four rounds with progressively fewer actions (8 / 7 / 6 / 5).

Each turn you take ONE action:
  - PLAY A BIRD: pay its food cost (any food in your supply), then drop it onto the matching habitat row — Forest, Grassland, or Wetland — with up to 5 birds per row.
  - USE A HABITAT: trigger that row.
      • Forest gains you (row size + 1) food.
      • Grassland lays (row size + 1) eggs on your birds, capped at each bird's egg capacity.
      • Wetland draws (row size + 1) bird cards from the deck.
    After the base reward, every bird already on that row activates its power (right → left): "gain food", "draw card", "lay egg", "tuck a bird from hand", "cache food on this bird", or passive bonus VP.

End-of-round bonus tile: at the end of each round, whichever player leads the round's criterion (most birds in Forest / most eggs / most cards in hand / most Wetland VP) earns 5 bonus VP, runner-up earns 2. Ties split.

Final score = sum of VP printed on your played birds + eggs (1 each) + food cached on cards + birds tucked under other birds (1 each) + end-of-round bonuses. The leaderboard records your score only if you outscore every CPU.

CPU strategy: greedy. If it can afford to play a bird, it plays the highest-VP playable bird. Otherwise it activates whichever habitat has the most birds (ties: Forest > Wetland > Grassland).

ADVANCED RULES OMITTED (L tier):
  - Per-food-type costs (worm / grain / fruit / fish / rodent) are simplified to a single generic food pool. Cards display a numeric cost.
  - Bird draft tray is omitted — players draw from the top of the deck.
  - Per-player bonus cards (3-card draft at setup) are not implemented; you start with a single static bonus card preview.
  - Action cubes are tracked implicitly via remaining-actions; the "trigger only birds left of the cube" rule is not enforced.
  - Several brown / pink power categories are folded into the 6 generic powers above. No once-between-turns powers, no end-of-round chains.
  - Nectar (expansion food) is not present.`,
  settings,
  initialState: (seed: number, s: WingspanFullSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "round_end") {
      return { selector: '[data-testid="wingspan-full-advance"]', pulses: 3 };
    }
    if (state.phase === "playing" && state.current === 0) {
      // Prefer playing a bird if any is affordable.
      const p = state.players[0];
      if (p) {
        for (const id of p.hand) {
          // Lazy: just point at the play-bird button list.
          return { selector: `[data-testid="wingspan-full-play-${id}"]`, pulses: 3 };
        }
      }
      return { selector: '[data-testid="wingspan-full-use-forest"]', pulses: 3 };
    }
    if (state.phase === "playing") {
      return { selector: '[data-testid="wingspan-full-cpu-tick"]', pulses: 3 };
    }
    return null;
  },
  component: WingspanFull,
};
