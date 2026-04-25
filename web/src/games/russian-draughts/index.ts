import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RDState, RDAction, RDSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RussianDraughts } from "./Game.js";

const settings = {} as const;

export const russianDraughtsPlugin: GamePlugin<RDState, RDAction, typeof settings> = {
  id: "russian-draughts",
  title: "Russian Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "8×8 draughts with backward captures and flying kings (damki) — popular across Eastern Europe.",
  howToPlay: `Russian Draughts (Shashki) is the standard form of draughts played across Russia and Eastern Europe. It is played on an 8×8 board with 12 pieces per side on the dark squares of the first three rows. You play White; the bot plays Black.

The key differences from American Checkers: men capture both forward AND backward (not just forward), and kings are "flying kings" (damki) that slide any number of squares diagonally. Another unique rule: if a man reaches the opponent's back row during a capture chain, it immediately becomes a king and may continue jumping in any direction.

Capture is mandatory. If multiple capture sequences are available, you may choose any — the maximum-capture rule does not apply (unlike International Draughts). Click a white piece to select it; highlighted squares show legal moves. Click a destination to move.

Win by capturing all opponent pieces or leaving them with no legal moves. The bot uses minimax at depth 4. Flying kings are extremely powerful — race to promote your men while keeping the bot's kings in check.`,
  settings,
  initialState: (seed: number, s: RDSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: RussianDraughts,
};
