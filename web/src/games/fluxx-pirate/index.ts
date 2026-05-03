import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxPirateState, FluxxPirateAction, FluxxPirateSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FluxxPirateGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxPiratePlugin: GamePlugin<FluxxPirateState, FluxxPirateAction, typeof settings> = {
  id: "fluxx-pirate", title: "Pirate Fluxx", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pirate Fluxx variant trivia. Identify which buccaneer card belongs in the deck.",
  howToPlay: "Pirate Fluxx celebrates Looney Labs' swashbuckling 2012 Fluxx variant. Twelve rounds present cards from the Pirate Fluxx deck — you pick the card type (Keeper, Goal, Action, New Rule, Creeper). Ten points per correct, 120 max. Pirate Fluxx adds buried-treasure flavour with Keepers like Map, Ship, Sword, and Treasure. Goals like 'Buried Treasure' or 'Pirate's Booty' tie them together. Creepers like Sea Monster and the dreaded Black Spot complicate the chase for plunder. Action cards include Shanghai (steal a player) and Sail Away. Pirate fans love the X-marks-the-spot energy and routinely score 100+; casual quizzers can still aim for 60-80. Run takes about two minutes. Submit each guess and Next to advance. Pirate Fluxx is one of the most thematically tight Fluxx variants and a great bridge between board-game pirates and card-game chaos. Recommended for anyone who loved Sid Meier's Pirates! or Treasure Island.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxPirateSettings),
  reducer, isTerminal, hint: (state: FluxxPirateState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-pirate-answer-0"]', pulses: 3 } : null, component: FluxxPirateGame,
};
