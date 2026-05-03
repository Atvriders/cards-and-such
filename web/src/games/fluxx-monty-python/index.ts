import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxMontyPythonState, FluxxMontyPythonAction, FluxxMontyPythonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FluxxMontyPythonGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxMontyPythonPlugin: GamePlugin<FluxxMontyPythonState, FluxxMontyPythonAction, typeof settings> = {
  id: "fluxx-monty-python", title: "Monty Python Fluxx", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Monty Python Fluxx variant trivia. Identify Holy Grail card type.",
  howToPlay: "Monty Python Fluxx tests your knowledge of Looney Labs' Holy Grail-themed Fluxx variant. Twelve rounds present cards from the Monty Python Fluxx deck — pick its type (Keeper, Goal, Action, New Rule, Creeper). Ten points per correct, 120 max. The deck adapts Monty Python and the Holy Grail with Keepers like Coconuts, Holy Hand Grenade, Sir Robin, and the Holy Grail itself. Creepers include the Knights Who Say Ni!, the Killer Rabbit, and the French Taunter. Goals tie quote-mashups together: 'King of England' (Arthur + Holy Grail), 'Burn the Witch' (Witch + Stake). Actions include 'Run Away!' and 'I'm Not Dead Yet!' Python fans hit 100+; casual quizzers aim for 60-80. Run takes around two minutes. Submit each guess and Next to advance. A sharp introduction to Looney Labs' irreverent Python-themed deck — recommended for anyone who can quote 'Always Look on the Bright Side of Life' from memory.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxMontyPythonSettings),
  reducer, isTerminal, hint: (state: FluxxMontyPythonState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-monty-python-answer-0"]', pulses: 3 } : null, component: FluxxMontyPythonGame,
};
