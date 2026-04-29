import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersArmadaState, SevenWondersArmadaAction, SevenWondersArmadaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersArmadaGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersArmadaPlugin: GamePlugin<SevenWondersArmadaState, SevenWondersArmadaAction, typeof settings> = {
  id: "seven-wonders-armada",
  title: "7 Wonders: Armada",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Naval expansion draft with fleet card layer.",
  howToPlay: "7 Wonders: Armada is a homage to Antoine Bauza and Bruno Cathala's Armada expansion, where naval fleets add a fourth dimension to the drafting structure. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a fleet tier); five earn an additional +15 (a flagship). Pairs of rank earn +5 (a naval skirmish win); three-of-a-kind +10 (a fleet engagement). Raw ranks sum as cargo. Score equals tableau total plus +25 for beating the CPU. Strategy: naval expansions reward committing to high-rank suits early since fleets scale fast. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersArmadaSettings),
  reducer,
  isTerminal,
  component: SevenWondersArmadaGame,
};
