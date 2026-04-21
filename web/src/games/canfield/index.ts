import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanfieldState, CanfieldAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Canfield } from "./Canfield.js";

export const canfieldSettings = {} as const;

type CanfieldSettings = SettingsOf<typeof canfieldSettings>;

export const canfieldPlugin: GamePlugin<CanfieldState, CanfieldAction, typeof canfieldSettings> = {
  id: "canfield",
  title: "Canfield",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reserve, foundation, tableau. Foundation starts at a variable rank.",
  howToPlay: `Move all 52 cards to the four foundations to win.

Deal: A 13-card reserve pile sits at top-left (only the top card is playable). The game deals one card face-up to each of the four foundations to establish the starting rank — that rank wraps around (e.g. if 8, foundations run 8–9–10–J–Q–K–A–2–3–4–5–6–7). The four tableau columns each start with one card. Remaining cards form the stock.

Moves: Tableau builds down in alternating colors (same as Klondike). Drag cards or click to auto-move them. Empty tableau columns are immediately and automatically refilled from the reserve. Draw 3 cards at a time from the stock to the waste; the waste top is always playable. Click the stock again when empty to recycle the waste.

Scoring: +5 points for each card moved to a foundation.

Tips: The reserve is your main source of tableau fuel — try to expose deeper reserve cards by clearing tableau columns. Because foundations wrap around, pay attention to what rank you need next; it's easy to block yourself. Prioritize getting all four foundation suits to the same base rank so you can build them in sync.`,
  settings: canfieldSettings,
  initialState: (seed: number, settings: CanfieldSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Canfield,
};
