import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBoxingKoState, DiceBoxingKoAction, DiceBoxingKoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBoxingKoGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceBoxingKoPlugin: GamePlugin<DiceBoxingKoState, DiceBoxingKoAction, typeof settings> = {
  id: "dice-boxing-ko",
  title: "Dice Boxing KO",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Boxing KO: 12 rounds; land strikes, hunt the KO.',
  howToPlay: 'Dice Boxing KO is a real, dice-driven simulation. Dice Boxing KO: 12 rounds; land strikes, hunt the KO.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBoxingKoSettings),
  reducer,
  isTerminal,
  component: DiceBoxingKoGame,
};
