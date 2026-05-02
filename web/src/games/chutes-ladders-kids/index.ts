import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KidsState, KidsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChutesLaddersKids } from "./Game.js";

export const chutesLaddersKidsSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type ChutesKidsSettingsType = SettingsOf<typeof chutesLaddersKidsSettings>;

export const chutesLaddersKidsPlugin: GamePlugin<KidsState, KidsAction, typeof chutesLaddersKidsSettings> = {
  id: "chutes-ladders-kids",
  title: "Chutes & Ladders: Kids",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Quick kids version of Chutes & Ladders on a 30-square board with a D4!",
  howToPlay: `Chutes and Ladders: Kids Edition is a faster, friendlier version of the classic board game, designed for younger players. The board has just 30 squares instead of 100, and you roll a four-sided die (1 to 4) instead of a six-sided one, making each game shorter and less frustrating.

On your turn, click "Roll Die" to roll the d4 and move your piece forward by that many squares. Follow the numbered path around the board toward square 30. If you land at the bottom of a ladder, you climb up to the top — great luck! If you land at the top of a chute (slide), you slide down to the bottom — bad luck!

There are 4 ladders and 4 chutes on the board. The kids edition has slightly more ladders than chutes to keep the game moving forward and avoid frustrating setbacks.

You must land exactly on square 30 to win — if your roll would take you past it, you stay in place. First player to land on square 30 wins the game!

Bots roll automatically after you. Play against 1, 2, or 3 bot opponents. It's all luck, just like the classic — perfect for family game night with young kids!`,
  settings: chutesLaddersKidsSettings,
  initialState: (seed: number, settings: ChutesKidsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: KidsState) => {
    if (state.winner !== null) return null;
    return { selector: ".clk-roll-btn", pulses: 3 };
  },
  component: ChutesLaddersKids,
};
