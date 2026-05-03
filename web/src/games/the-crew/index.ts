import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CrewState, CrewAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TheCrewGame } from "./Game.js";

const settings = {} as const;

export const theCrewPlugin: GamePlugin<CrewState, CrewAction, typeof settings> = {
  id: "the-crew",
  title: "The Crew",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative trick-taking. Complete your mission by winning the right trick.",
  howToPlay: `The Crew is a cooperative trick-taking card game. You play as one of four players (the rest are bots) and must complete a secret mission together.

The deck has four suits (red, yellow, green, blue) numbered 1–9 and four rockets (trump) numbered 1–4. Each player receives 10 cards. The mission assigns a specific card to you — you must be the player who wins the trick containing that card.

On your turn, click a card once to select it, then click again to play it. You must follow the led suit if you have any cards of that suit. If you cannot follow suit, you may play any card. Rockets (trump) beat all other suits; within a suit, higher numbers win.

Bots play automatically using a simple strategy: follow the led suit with the highest card, or discard low non-trump cards if void.

The trick winner leads the next trick. If you win the trick containing your mission card — success! If another player wins that card, the mission fails.

Score: 100 for mission success, 0 for failure. Task card is highlighted in your hand. Plan carefully — coordinate through your play order and card choices, as in the real game you cannot communicate verbally.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: CrewState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-the-crew-primary"]', pulses: 3 };
  },
  component: TheCrewGame,
};
