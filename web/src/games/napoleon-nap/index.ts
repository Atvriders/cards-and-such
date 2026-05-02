import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapState, NapAction, NapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const napoleonNapPlugin: GamePlugin<NapState, NapAction, typeof settings> = {
  id: "napoleon-nap",
  title: "Napoleon (Nap)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nap — 5-card UK trick game.",
  howToPlay: "Nap — 5-card UK trick game. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as NapSettings),
  reducer,
  isTerminal,
  component: NapGame,
};
