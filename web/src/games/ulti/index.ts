import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UltiState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Ulti } from "./Ulti.js";

const ultiSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type UltiSettingsType = SettingsOf<typeof ultiSettings>;
type UltiAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

export const ultiPlugin: GamePlugin<UltiState, UltiAction, typeof ultiSettings> = {
  id: "ulti",
  title: "Ulti",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hungarian 3-player trick-taking game where one player bids against two defenders.",
  howToPlay: `Ulti is one of Hungary's most popular card games, played by three players. One player becomes the declarer (the solo player) who bids to win a certain number of tricks; the other two work together as defenders to stop them.

Bidding: Each player bids how many tricks they'll win (1–10). The highest bidder becomes the declarer and chooses trump based on their longest suit. The other two players become partners for this hand.

Play: The declarer leads the first trick. This is a 3-player game, so each trick contains 3 cards. Players must follow the led suit if possible. If unable, they must play trump if they have it. Highest trump wins; if no trump, highest of led suit wins.

Scoring: If the declarer takes at least as many tricks as bid, they score +bid points. If set, they lose bid points. Defenders gain or lose the same amount collectively against the declarer.

The game rewards bold bidding and careful trump management. Defenders should coordinate to set the declarer — lead through their weak suits and ruff (trump) when possible.

Click a number to bid, then click cards to play. Legal plays are highlighted.`,
  settings: ultiSettings,
  initialState: (seed: number, settings: UltiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: UltiState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-ulti-primary"]', pulses: 3 };
  },
  component: Ulti,
};
