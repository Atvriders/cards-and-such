import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClassicState, ClassicAction, ClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GameOfLifeClassicGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gameOfLifeClassicPlugin: GamePlugin<ClassicState, ClassicAction, typeof settings> = {
  id: "game-of-life-classic",
  title: "Game of Life (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin and travel a 30-square life path. Marry, raise kids, work, retire — score your life.",
  howToPlay: `Game of Life (Classic) is a one-player tour through the milestones of an imaginary life. You begin at square 1 with $100 and a family of 1 (just you).

On every turn press Spin to roll a number from 1 to 10 — the spinner advances your token along a 30-square board. Each square is a life event with a fixed effect:

— Paydays add cash ($50–$100).
— Promotions and lottery hits award the biggest cash boosts.
— Expenses, taxes, and vacations cost money.
— Marriage and Baby squares grow your family by one (and cost cash).
— The final square is Retire — landing on or past it ends the game.

Your final Life Score is your remaining cash plus 25 per family member. Hitting paydays and lottery squares early in the run compounds nicely; spinning past expensive squares is lucky.

A typical run finishes between turns 4 and 10. Aim for over 400 to feel rich; over 700 means you spun lucky. The game always ends — every spin moves you forward.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClassicSettings),
  reducer,
  isTerminal,
  component: GameOfLifeClassicGame,
};
