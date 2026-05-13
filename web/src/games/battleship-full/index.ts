import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type {
  BattleshipFullState,
  BattleshipFullAction,
  BattleshipFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const BattleshipFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.BattleshipFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {} as const;

export const battleshipFullPlugin: GamePlugin<
  BattleshipFullState,
  BattleshipFullAction,
  typeof settings
> = {
  id: "battleship-full",
  title: "Battleship (Full Salvo + Advanced)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Full salvo rules with sonar pings, fighter jets, and a 5-ship advanced fleet vs. a hunting AI.",
  howToPlay: `Battleship Full adds the official salvo and advanced rules on top of classic Battleship. You play 1-vs-1 against a CPU that uses canonical parity-search + target-mode hunting.

Setup. Place 5 ships on your 10×10 board: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2). Click cells to place; use Rotate to switch between horizontal and vertical. Auto-Place positions your full fleet using the no-touch rule (no two ships orthogonally or diagonally adjacent). The CPU's fleet is placed randomly with no-touch enforced.

Salvo mode. Every turn you fire ONE shot per surviving ship — full fleet = 5 shots, last ship alive = 1 shot. Click enemy cells to queue shots (they show as orange ⊙). Click again to un-queue. When you've queued the exact number of shots, press Fire All to launch them simultaneously. The CPU then fires its own salvo (one shot per surviving CPU ship) before your next turn.

Sonar Ping (1 use per game). Switch to Sonar mode and click any enemy cell. Every enemy ship cell inside the resulting 3×3 footprint is revealed (gold ◉). It does NOT cost a salvo slot and the CPU does not retaliate.

Fighter Jet (1 use per game). A wildcard free shot. Switch to Fighter Jet mode and click any enemy cell — the result resolves immediately and does NOT cost a salvo slot and does NOT trigger a CPU turn. Great for guaranteed extra damage on a turn when you're already lining up a kill.

CPU strategy. The CPU runs canonical Battleship AI: HUNT mode shoots only on parity squares (where row+col is even — guaranteed to overlap every ship because the smallest ship is length 2), preferring the centre half of the board. When it lands a hit it switches to TARGET mode and probes the four orthogonal neighbours. With two collinear hits it locks onto the line and extends. After sinking a ship it clears stale targets and returns to HUNT.

Win. Sink all 5 enemy ships before the CPU sinks yours. Your score is 100 + 20 per surviving ship + 10 for each unused special ability.`,
  settings,
  initialState: (seed: number, s: BattleshipFullSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: BattleshipFullState) => {
    const t = isTerminal(s);
    if (t) return null;
    if (s.phase === "setup") {
      return { selector: '[data-testid="auto-place"]', pulses: 3 };
    }
    if (s.phase === "playing") {
      // If salvo is ready, point at Fire All; otherwise direct attention to the enemy grid.
      const need = s.playerShips.filter((sh) => sh.hits < sh.size).length;
      if (s.pendingShots.length === need && need > 0) {
        return { selector: '[data-testid="fire-salvo"]', pulses: 3 };
      }
      return { selector: '[data-testid="enemy-5-5"]', pulses: 3 };
    }
    return null;
  },
  component: BattleshipFullGame,
};
