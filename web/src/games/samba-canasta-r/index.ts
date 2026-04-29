import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SambaCanastaRState, SambaCanastaRAction, SambaCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SambaCanastaRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sambaCanastaRPlugin: GamePlugin<SambaCanastaRState, SambaCanastaRAction, typeof settings> = {
  id: "samba-canasta-r", title: "Samba Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant where same-suit sequences also count as canastas.",
  howToPlay: "Samba Canasta is a Canasta variant played with three decks where same-suit sequences (sambas) are valid melds in addition to standard rank-sets. Sequences must contain at least seven cards to score the canasta-equivalent bonus.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand identifying rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. A run is three or more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card, so a seven-card samba pays forty-two — the bonus you'd see in the original game's structure. With no melds you receive a small consolation. Clearing your hand earns thirty bonus.\n\nExpected score across five rounds is sixty to one hundred. The deeper eleven-card hand gives you regular access to long sequences. One samba per game is realistic; two pushes you toward the high end of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SambaCanastaRSettings),
  reducer, isTerminal, component: SambaCanastaRGame,
};
