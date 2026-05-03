import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tapaMiniRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "tapa-mini-race",
  title: "Tapa (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Turkish Tapa variant — pin pieces in place, race them home on a smaller track.",
  howToPlay: "Tapa is the Turkish backgammon variant where landing on an opponent's lone checker pins it in place rather than sending it to the bar. The pinned checker cannot move until the pinning piece leaves. This Mini version uses a shortened 18-point track with twelve checkers per side for a faster paced game.\n\nYou play the white side against a random CPU. Click Roll to throw two six-sided dice, then click one of your checkers and pick a die value (or the sum) to advance it. Each die is used once per turn.\n\nThe track is shown horizontally. White checkers race left to right; black checkers race right to left. The cell beyond the last point is the bear-off zone. Get all twelve of your checkers there before the CPU does to win.\n\nBecause the track is short and there is no hitting, advance your runners aggressively. The CPU plays random legal moves, so straightforward pip-management wins consistently. The score is your pip-count differential at game end; aim for +20 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-tapa-mini-race-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
