import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnockOutWhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KnockOutWhist } from "./KnockOutWhist.js";

export const knockOutWhistSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["2", "3", "4"] as const,
    default: "3" as const,
  },
} as const;

type KOWSettingsType = SettingsOf<typeof knockOutWhistSettings>;
type KOWAction = { type: "play"; cardId: string } | { type: "next-round" };

export const knockOutWhistPlugin: GamePlugin<KnockOutWhistState, KOWAction, typeof knockOutWhistSettings> = {
  id: "knock-out-whist",
  title: "Knock-Out Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Elimination trick-taking. Lowest scorer knocked out each round. Last one standing wins!",
  howToPlay: `Knock-Out Whist is an elimination trick-taking game for 3–5 players (you plus 2–4 bots).

Setup: Round 1 deals 7 cards each. A random trump suit is chosen. Each subsequent round deals one fewer card (6, 5, 4, 3, 2, 1).

Play: Follow standard trick-taking rules — you must follow the led suit if possible. If you cannot follow suit you may play any card including trump. The highest trump wins; otherwise the highest card of the led suit wins. The winner of each trick leads the next.

Elimination: At the end of each round the player(s) with the fewest tricks won are knocked out. If multiple players tie for fewest they are all eliminated. Surviving players advance to the next round.

Winning: The last player remaining wins. If only one player survives after any round that player is declared the winner. With a single card round the player who wins that one trick wins.

Strategy: In early rounds try to win at least a few tricks to stay safe. In later rounds with fewer cards every trick is critical. Trump when you need to — don't waste high trumps early.

Controls: Click a highlighted card to play it. Click "Next Round" between rounds to continue.`,
  settings: knockOutWhistSettings,
  initialState: (seed: number, settings: KOWSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: KnockOutWhist,
};
