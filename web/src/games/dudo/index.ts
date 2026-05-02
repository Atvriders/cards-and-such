import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DudoState, DudoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dudo } from "./Dudo.js";

export const dudoSettings = {
  startingDice: {
    kind: "enum" as const,
    label: "Starting Dice",
    options: ["3", "4", "5"] as const,
    default: "5" as const,
  },
} as const;

type DudoSettingsType = SettingsOf<typeof dudoSettings>;

export const dudoPlugin: GamePlugin<DudoState, DudoAction, typeof dudoSettings> = {
  id: "dudo",
  title: "Dudo",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "2-player bluffing dice with ones-as-wilds — bid or call the bluff!",
  howToPlay: `Dudo is a streamlined 2-player bluffing game where ones count as wild dice. Each player secretly rolls their dice at the start of every round.

The opening player makes a bid: "There are at least N dice showing face F." Ones are wild and count toward any face except when the bid is for ones. The opponent must either raise the bid (higher count, or the same count with a higher face) or shout "Dudo!" to challenge.

When Dudo is called, all dice are revealed and the actual count (including wild ones) is compared to the bid. If the actual count meets or beats the bid, the bid was accurate — the challenger loses a die. If the count falls short, the bid was a bluff — the bidder loses a die. The player who lost a die goes first in the next round.

Lose all your dice and the game is over. The player still holding dice wins.

Strategy: ones in your hand are powerful wildcards — factor them in when bidding and challenging. Early rounds with many total dice favour raises; late rounds with few dice favour bold challenges.`,
  settings: dudoSettings,
  initialState: (seed: number, settings: DudoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: DudoState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase !== "bid") return null;
    const bid = state.currentBid;
    if (!bid) {
      return { selector: '[data-testid="hint-target-dudo-bid"]', pulses: 3 };
    }
    // Estimate actual count of bid.face including wilds
    const playerKnown = state.playerRoll.filter((d) => d === bid.face || (bid.face !== 1 && d === 1)).length;
    // Bot expected contribution: 1/3 of dice (face + wild) for non-1 faces, 1/6 for 1s
    const expected = playerKnown + state.botDice * (bid.face !== 1 ? 2 : 1) / 6;
    // High doubt → call
    if (bid.count > expected * 1.5) {
      return { selector: '[data-testid="hint-target-dudo-call"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-dudo-bid"]', pulses: 3 };
  },
  component: Dudo,
};
