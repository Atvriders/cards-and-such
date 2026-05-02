import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Trek12ArcticState, Trek12ArcticAction, Trek12ArcticSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Trek12ArcticGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const trek12ArcticPlugin: GamePlugin<Trek12ArcticState, Trek12ArcticAction, typeof settings> = {
  id: "trek-12-arctic",
  title: "Trek 12 Arctic",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arctic Trek 12 — dice on icy chain links with frost bonuses.",
  howToPlay: `Trek 12 Arctic is a Trek 12 style chain dice game.

How to play
1. Roll two d6.
2. Combine them by sum / difference / max / min.
3. Place the result onto an empty node in the 12-node chain.
4. Score = result + chain bonus (+3 if a neighbor matches).

Theme: All ≤3 rolls: ice bonus +5.

End-of-game bonuses
- Longest run of identical adjacent values (≥3): +2 per node in run
- Full chain (all 12 filled): +12

Game runs 12 rolls. Plan your operations to chain duplicates and rack up bonuses.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as Trek12ArcticSettings),
  reducer,
  isTerminal,
  component: Trek12ArcticGame,
};
