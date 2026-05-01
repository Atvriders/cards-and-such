import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MightyState, MightyAction, MightySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MightyGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mtyPlugin: GamePlugin<MightyState, MightyAction, typeof settings> = {
  id: "mighty",
  title: "Mighty",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mighty — Korean trick game with bidding.",
  howToPlay: "Mighty — Korean trick game with bidding. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as MightySettings),
  reducer,
  isTerminal,
  component: MightyGame,
};
