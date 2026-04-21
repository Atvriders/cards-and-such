import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlondikeState, KlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Klondike } from "./Klondike.js";

export const klondikeSettings = {
  drawMode: { kind: "enum", label: "Draw", options: ["1", "3"] as const, default: "1" },
  scoringMode: {
    kind: "enum",
    label: "Scoring",
    options: ["standard", "vegas"] as const,
    default: "standard",
  },
} as const;

type KlondikeSettings = SettingsOf<typeof klondikeSettings>;

export const klondikePlugin: GamePlugin<KlondikeState, KlondikeAction, typeof klondikeSettings> = {
  id: "klondike",
  title: "Klondike Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Klondike — build up the foundations from Ace to King.",
  howToPlay: `Build all four foundation piles up from Ace to King, one pile per suit.

Deal: 7 tableau columns with 1–7 cards, only the top card face-up. The stock (draw pile) and waste live at top-left. The four foundations sit top-right.

Moves: On the tableau, build down in alternating colors (red-on-black). An empty tableau slot accepts any card — Kings especially. Move a single card or a valid descending sequence. Click a card to auto-move to the best legal destination, or drag it manually. Draw from the stock to turn up cards onto the waste; the waste top is playable.

Scoring: Standard scoring awards +10 for moving a card to a foundation, +5 when the waste feeds the tableau, and +5 each time a face-down card is revealed. Vegas scoring starts at −52 and pays +5 per foundation card.

Tips: Build your foundations patiently — don't send every Ace and 2 up immediately if you still need those on the tableau. Empty columns are precious; fill them with Kings. Use Auto-move when you're confident the remaining game is trivial.`,
  settings: klondikeSettings,
  initialState: (seed: number, settings: KlondikeSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Klondike,
};
