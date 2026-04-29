import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PitShedState, PitShedAction, PitShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PitShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pitShedPlugin: GamePlugin<PitShedState, PitShedAction, typeof settings> = {
  id: "pit-shed", title: "Pit (Trading)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Open-outcry commodity trading shedding.",
  howToPlay: "Pit is the classic 1903 commodity-trading shedding game where players shout offers and trades to corner a market. Each player tries to collect a complete set of nine identical commodity cards — wheat, oats, barley, corn, rye, flax — and ring the bell to win the round.\n\nIn this simplified single-player version you race the CPU across six rounds. Each round you and the CPU trade cards through a simulated open outcry. The first side to corner a commodity rings the bell and scores twenty points plus a five-point speed bonus.\n\nThe original 1903 Parker Brothers game included Bull and Bear cards as wild cards and penalty cards respectively; in this adaptation a bull adds five bonus points if you ring with it in hand, and a bear costs five if you do not unload it. Aim for around eighty points across six rounds. Press Play and corner the market.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PitShedSettings),
  reducer, isTerminal, component: PitShedGame,
};
