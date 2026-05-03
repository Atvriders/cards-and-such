import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MariageState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mariage } from "./Mariage.js";

export const mariageSettings = {} as const;
type MariageSettings = SettingsOf<typeof mariageSettings>;
type MariageAction = { type: "play"; cardId: string };

export const mariagePlugin: GamePlugin<MariageState, MariageAction, typeof mariageSettings> = {
  id: "mariage",
  title: "Mariage (66)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German 2-player trick-taking game (66). Race to 66 points with a 24-card deck and marriage bonuses.",
  howToPlay: `Mariage, also known as "66", is a popular Central European 2-player card game using a 24-card deck (9 through Ace of each suit). The goal: be the first to reach 66 points.

**Deal:** Each player receives 6 cards. One card is turned face-up to set the trump suit; remaining cards form the stock.

**Card Values:** Ace=11, Ten=10, King=4, Queen=3, Jack=2, Nine=0.

**Open Phase (while stock has cards):** Lead any card freely — no obligation to follow suit or trump. After each trick, both players draw one card from stock (winner draws first).

**Marriages:** Holding both King and Queen of the same suit is a "marriage." When you lead either card from a marriage pair (highlighted in orange), you score 20 points — or 40 if it's the trump suit. The bot also uses marriages automatically.

**Closed Phase (stock exhausted):** You must now follow the led suit. If you cannot, you must trump. If you cannot trump, discard any card.

**Winning:** First player to reach 66+ points wins the hand. If the stock runs out and no one has reached 66, highest total wins.

**Strategy:** Secure marriages early, draw trump cards strategically, and count the remaining deck carefully.`,
  settings: mariageSettings,
  initialState: (seed: number, _settings: MariageSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: MariageState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-mariage-primary"]', pulses: 3 };
  },
  component: Mariage,
};
