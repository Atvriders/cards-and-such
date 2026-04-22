import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Whist } from "./Whist.js";

export const whistSettings = {
  botBidding: {
    kind: "enum" as const,
    label: "Bot Style",
    options: ["conservative", "balanced"] as const,
    default: "balanced" as const,
  },
} as const;

type WhistSettingsType = SettingsOf<typeof whistSettings>;
type WhistAction = { type: "play"; cardId: string };

export const whistPlugin: GamePlugin<WhistState, WhistAction, typeof whistSettings> = {
  id: "whist",
  title: "Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 4-player partnership trick-taking. Last dealt card names trump.",
  howToPlay: `Whist is a classic partnership trick-taking game for 4 players. You and Bot 2 form one team; Bot 1 and Bot 3 form the other.

Setup: A standard 52-card deck is dealt 13 cards each. The final card dealt to the dealer is turned face-up to declare the trump suit. That card is then added to the dealer's hand.

Play: The player to the dealer's left leads the first trick. You must follow the led suit if possible; if you cannot follow suit you may play any card including trump. The highest trump wins the trick if any trump was played; otherwise the highest card of the led suit wins. The winner of each trick leads the next.

Scoring: Count the number of tricks your team took above 6 (the "book"). Tricks 7 through 13 each score one point for your team. The first team to 7 points across multiple hands wins the rubber, but this version plays a single hand — your team's tricks above 6 is your score.

Strategy: Cover partner's high cards with low cards. Trump judiciously — leading trump to draw out opponents' trumps is a key tactic. Signal suit length by your card choices.

Controls: Click a highlighted card in your hand to play it. Dimmed cards are not legal plays for this trick.`,
  settings: whistSettings,
  initialState: (seed: number, settings: WhistSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Whist,
};
