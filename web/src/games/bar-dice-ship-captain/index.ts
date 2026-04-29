import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShipCaptainCrewState, ShipCaptainCrewAction, ShipCaptainCrewSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShipCaptainCrewGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const barDiceShipCaptainPlugin: GamePlugin<ShipCaptainCrewState, ShipCaptainCrewAction, typeof settings> = {
  id: "bar-dice-ship-captain",
  title: "Ship Captain Crew",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-dice pub game. Roll ship (6), captain (5), crew (4) in sequence.",
  howToPlay: "Ship Captain Crew is a five-dice pub-bar game where you must roll a 6 (the ship), then a 5 (the captain), then a 4 (the crew) in sequence, and only after all three appear can you score the remaining two dice (the cargo). In this simplified single-press version, the engine simulates one full turn: it rolls all five dice, attempts to assemble the ship-captain-crew sequence, and scores any leftover cargo. Each turn you press Roll, the simulation runs, and you score 0-20 points based on luck (5% perfect bullseye = 20, descending tiers down to a miss). After the result, press Next to roll again. Across ten turns, the typical score is 60-90; great runs land above 130. The pub original involves keeping qualifying dice and rerolling; here it's compressed into a single roll-and-score, with the same statistical distribution.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShipCaptainCrewSettings),
  reducer,
  isTerminal,
  component: ShipCaptainCrewGame,
};
