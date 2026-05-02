import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BarDiceShipCaptainState, BarDiceShipCaptainAction, BarDiceShipCaptainSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarDiceShipCaptainGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const barDiceShipCaptainPlugin: GamePlugin<BarDiceShipCaptainState, BarDiceShipCaptainAction, typeof settings> = {
  id: "bar-dice-ship-captain",
  title: "Ship, Captain & Crew",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Ship Captain Crew: roll 5 dice up to 3 times; lock 6, 5, 4 in order, then count crew.',
  howToPlay: 'Ship, Captain & Crew is a real, dice-driven simulation. Ship Captain Crew: roll 5 dice up to 3 times; lock 6, 5, 4 in order, then count crew.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarDiceShipCaptainSettings),
  reducer,
  isTerminal,
  hint: (state: BarDiceShipCaptainState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-bar-dice-ship-captain-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-bar-dice-ship-captain-next"]', pulses: 3 };
    return null;
  },
  component: BarDiceShipCaptainGame,
};
