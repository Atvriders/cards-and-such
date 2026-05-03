import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TicTacToeBlitzState, TicTacToeBlitzAction, TicTacToeBlitzSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TicTacToeBlitzGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TicTacToeBlitzGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ticTacToeBlitzPlugin: GamePlugin<TicTacToeBlitzState, TicTacToeBlitzAction, typeof settings> = {
  id:"tic-tac-toe-blitz", title:"Tic Tac Toe Blitz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"60-second rapid Tic Tac Toe vs CPU. Play as many rounds as you can.",
  howToPlay:`Tic Tac Toe Blitz is a 60-second speed challenge against a random-CPU opponent. You play as X. Tap any empty cell to mark it; the CPU instantly responds with O in a random open cell. Get three Xs in a row, column, or diagonal to win the round.

Round wins score 30 points, draws score 5, and losses score zero. After every finished round (win/draw/loss), tap Next Round to clear the board and start again. The clock keeps ticking through every game — keep finishing rounds fast for the highest score.

The CPU plays purely at random, so a careful X player wins more often than not. A typical 60-second blitz finishes 6-10 rounds; expert blitzers grind out 150-220 points.

Watch the timer in the top-right; when it hits zero, your final score locks in. Tic Tac Toe Blitz turns the world's simplest grid game into a fast-twitch numbers chase.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TicTacToeBlitzSettings),
  reducer,isTerminal,hint: (state: TicTacToeBlitzState): HintTarget | null => state.phase === "playing" ? { selector: '.tttblitz-board', pulses: 3 } : null, component:TicTacToeBlitzGame,
};
