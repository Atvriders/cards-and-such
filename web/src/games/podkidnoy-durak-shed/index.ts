import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PodkidnoyDurakShedState, PodkidnoyDurakShedAction, PodkidnoyDurakShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PodkidnoyDurakShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const podkidnoyDurakShedPlugin: GamePlugin<PodkidnoyDurakShedState, PodkidnoyDurakShedAction, typeof settings> = {
  id: "podkidnoy-durak-shed", title: "Podkidnoy Durak", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Throwing-in Durak variant.",
  howToPlay: "Podkidnoy Durak is the most common variant of Russian Durak, the classic 'fool' card game. The unique feature is that any player may 'throw in' (podkidnoy) extra attacking cards of the same rank as those already on the table, even if it is not their turn.\n\nIn this single-player version you face the CPU across six rounds. Each round both players hold six cards and there is one trump suit. The attacker plays a card, the defender must beat it; the attacker may then throw in another card of the same rank, and on it goes until the defender beats every card or gives up and takes the lot.\n\nThe loser of each round (the 'fool') scores zero. The winner takes twenty points plus a bonus per remaining card. Across six rounds a strong score is around seventy points.\n\nPodkidnoy Durak is the version played in most Russian families and is the most popular card game in the country. Press Play to attack the CPU.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PodkidnoyDurakShedSettings),
  reducer, isTerminal, component: PodkidnoyDurakShedGame,
};
