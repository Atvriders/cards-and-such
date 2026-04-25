import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type KarmaState, type KarmaAction } from "./state.js";
import { KarmaGame } from "./Game.js";

export const karmaCardSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "1" as const },
} as const;

export const karmaCardPlugin: GamePlugin<KarmaState, KarmaAction, typeof karmaCardSettings> = {
  id: "karma-card",
  title: "Karma",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swap your lucky table cards, then shed your hand to win — what goes around comes around.",
  howToPlay: `Karma (also called Good Karma or What-Goes-Around) is a fun shedding card game for 2-4 players with a clever setup phase. Each player starts with three hand cards, three face-up table cards, and three face-down (blind) cards.

Before play begins each player secretly swaps any number of hand cards with their face-up table cards to arrange the best possible table cards. Bots do the same automatically. Once everyone confirms, the play phase starts.

On your turn, play one or more cards of the same rank onto the discard pile — the card played must equal or beat the top of the pile. If you cannot (or choose not to), pick up the entire discard pile into your hand. Special: 2 plays on anything and resets the pile; 10 burns the pile and removes it from the game. Playing four of the same rank in a row also burns the pile.

Once your hand is empty and the draw pile is gone you play from your face-up table cards. After those are gone, flip blind cards one at a time. A blind card that cannot play forces you to take the pile.

The first player to shed all cards — hand, up, and down — wins.

Scoring: 500 for a win, 50 for a loss.`,
  settings: karmaCardSettings,
  initialState,
  reducer,
  isTerminal,
  component: KarmaGame,
};
