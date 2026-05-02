import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Ludus12State, Ludus12Action, Ludus12Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Ludus12Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ludus12Plugin: GamePlugin<Ludus12State, Ludus12Action, typeof settings> = {
  id: "ludus-12",
  title: "Ludus Duodecim",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roman 'Twelve Lines' three-dice race — call your pattern.",
  howToPlay: "Ludus Duodecim Scriptorum, the 'Game of Twelve Lines', was a Roman ancestor of Tabula and backgammon played with three dice. The historical version saw pieces race across twelve lines on a marble board; this variant focuses on the three-dice probability that drove that race. Across 12 rounds three dice are rolled. Predict the dice pattern: Triples (all three faces equal) pays +60, All Different (three distinct values) pays +15, One Pair (exactly two equal) pays +20. Triples are rare (1 in 36) but lucrative, All Different is most common (about 56%) and pays modestly, One Pair sits at about 42% with a middle payout. Wrong call scores zero. Strategy: never pick Triples consistently, but punt one or two rounds since the +60 hits cover four flat losses. Twelve rounds, top score wins. The mathematical lesson echoes how Roman gamblers learned dice odds long before Pascal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Ludus12Settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-ludus-12-roll"]', pulses: 3 };
  },
  component: Ludus12Game,
};
