import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersEdificeState, SevenWondersEdificeAction, SevenWondersEdificeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersEdificeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersEdificePlugin: GamePlugin<SevenWondersEdificeState, SevenWondersEdificeAction, typeof settings> = {
  id: "seven-wonders-edifice",
  title: "7 Wonders: Edifice",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Building projects shared draft with public bonuses.",
  howToPlay: "7 Wonders: Edifice is a homage to the Antoine Bauza expansion that adds shared building projects across the four ages, granting collective benefits or imposing penalties. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a project completion); five earn an additional +15 (the apex of the edifice). Pairs of rank earn +5 (a project contribution); three-of-a-kind +10 (a project lead). Raw ranks sum as building stones. Score equals tableau total plus +25 for beating the CPU. Strategy: the Edifice expansion rewards committing labor to one project; commit early to one suit. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersEdificeSettings),
  reducer,
  isTerminal,
  component: SevenWondersEdificeGame,
};
