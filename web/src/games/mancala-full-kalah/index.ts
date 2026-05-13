import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MancalaFullKalahState, MancalaFullKalahAction, MancalaFullKalahSettings } from "./state.js";
import { initialState, reducer, isTerminal, P0_PITS } from "./state.js";

const MancalaFullKalah = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.MancalaFullKalahGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {} as const;

export const mancalaFullKalahPlugin: GamePlugin<
  MancalaFullKalahState,
  MancalaFullKalahAction,
  typeof settings
> = {
  id: "mancala-full-kalah",
  title: "Mancala (Full Kalah, Match Play)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The classic 6-pit Kalah with empty-side capture, 'free turn on home,' and best-of-9 match scoring.",
  howToPlay: `Mancala — Full Kalah, Match Play

Setup. The board has two rows of six pits with a large home pit (kalah / store) at each end. Every pit starts with 4 seeds (24 per side, 48 total). You play the bottom row and your home is on the right. The CPU plays the top row.

Sowing. On your turn, click any of your non-empty pits. Pick up all the seeds and sow them one-by-one counter-clockwise into successive pits — through your remaining pits, into your own home, into the CPU's pits — but always skipping the CPU's home.

Free turn on home. If your very last seed lands exactly in your own home, you get another turn immediately.

Empty-side capture. If your very last seed lands in one of your own pits that was empty, and the opposite pit (across the board) is non-empty, you capture both the seed that landed AND every seed in the opposite pit into your home.

Round end. The round ends when all six pits on either side are empty. The other side then sweeps any seeds still in its own pits into its own home. Whoever has more seeds in their home wins the round; equal seeds is a draw.

Match. The match is best-of-9. First side to 5 round-wins takes the match; otherwise after 9 rounds whichever side has more round-wins wins. The loser of each round starts the next round (after a draw, you start).

CPU. The CPU uses a 3-ply alpha-beta minimax search over store differential plus a small bonus for seeds on its own side.`,
  settings,
  initialState: (seed: number, s: MancalaFullKalahSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: MancalaFullKalahState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.roundWinner !== null) return { selector: '[data-testid="next-round"]', pulses: 3 };
    if (state.turn !== 0) return null;
    // Suggest the rightmost non-empty pit (closest to home — most likely to
    // give a free turn or a sane sowing chain). Falls back to first non-empty.
    const candidates = [...P0_PITS].reverse().filter((p) => state.board[p]! > 0);
    const pick = candidates[0] ?? P0_PITS.find((p) => state.board[p]! > 0);
    if (pick === undefined) return null;
    return { selector: `[data-testid="pit-${pick}"]`, pulses: 3 };
  },
  component: MancalaFullKalah,
};
