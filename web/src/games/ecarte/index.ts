import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EcarteState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Ecarte } from "./Ecarte.js";

const ecarteSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type EcarteSettingsType = SettingsOf<typeof ecarteSettings>;

type EcarteAction =
  | { type: "propose" }
  | { type: "refuse" }
  | { type: "exchange"; ids: string[] }
  | { type: "play"; cardId: string };

export const ecartePlugin: GamePlugin<EcarteState, EcarteAction, typeof ecarteSettings> = {
  id: "ecarte",
  title: "Écarté",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic French 2-player trick-taking game with a card exchange phase.",
  howToPlay: `Écarté is an elegant two-player French card game played with a 32-card deck (7s through Aces). The goal is to win 3 or more of the 5 tricks, or all 5 (a vole) for bonus points.

The deck ranks cards from lowest to highest: 7, 8, 9, 10, J, Q, K, A. Trump suit is determined by the top card of the remaining stock.

Exchange Phase: The non-dealer (you) may propose an exchange. If you propose, you discard any number of cards and draw replacements from the stock. The bot may also exchange. Or you can refuse and play immediately.

Play: The non-dealer leads. Players must follow the led suit if they can. If unable, they must play trump if possible. The highest trump wins; if no trump, the highest card of the led suit wins.

Scoring: Taking 3 or 4 tricks scores 1 point; winning all 5 (vole) scores 2 points. The first player to reach 5 points wins the match.

Click "Propose Exchange" to swap cards, or "Refuse & Play" to play your hand as dealt. During exchange phase, click cards to select them for discarding, then confirm.`,
  settings: ecarteSettings,
  initialState: (seed: number, settings: EcarteSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "propose") return { selector: '[data-testid="hint-target-ecarte-propose"]', pulses: 3 };
    if (state.phase === "exchange") return { selector: '[data-testid="hint-target-ecarte-exchange"]', pulses: 3 };
    return null;
  },
  component: Ecarte,
};
