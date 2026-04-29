import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SviyiShedState, SviyiShedAction, SviyiShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SviyiShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sviyiShedPlugin: GamePlugin<SviyiShedState, SviyiShedAction, typeof settings> = {
  id: "sviyi-shed", title: "Sviyi", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ukrainian Durak-family game.",
  howToPlay: "Sviyi is a Ukrainian Durak-family card game with simplified rules and a fast pace. Like Durak, players attack and defend with a trump suit, but Sviyi adds the rule that doubled cards (pairs) may attack together.\n\nIn this single-player version you face the CPU across six rounds. Each round both players hold six cards. You may attack with a single card or a pair, and the defender must beat each. The first to empty their hand wins twenty points plus a five-point bonus per CPU card remaining.\n\nThe pair-attack rule makes Sviyi more aggressive than basic Durak and rewards players who hold pairs. Across six rounds a strong total is around seventy points; sweeping is rare.\n\nSviyi is widely played in Ukrainian families and at folk-game tournaments in Kyiv and Lviv. The name simply means 'one's own' in Ukrainian, referring to the trump suit. Press Play to attack the CPU with your strongest pair.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SviyiShedSettings),
  reducer, isTerminal, component: SviyiShedGame,
};
