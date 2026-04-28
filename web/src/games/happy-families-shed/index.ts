import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HappyFamiliesShedState, HappyFamiliesShedAction, HappyFamiliesShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HappyFamiliesShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const happyFamiliesShedPlugin: GamePlugin<HappyFamiliesShedState, HappyFamiliesShedAction, typeof settings> = {
  id: "happy-families-shed", title: "Happy Families", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Victorian set-collection shedding — auto-meld matching ranks each round.",
  howToPlay: "Happy Families is a Victorian-era card game where players collect complete sets of cards, originally drawn as cartoon families (Mr. Bun the Baker, his wife, and so on). In this short version, each round you are dealt eight random cards. The engine then identifies any complete sets of four matching ranks (\"families\") and any partial sets.\n\nA complete family of four scores twenty-five points. A partial set of three scores ten points. A partial set of two scores three points. Singletons score nothing. The CPU is dealt its own random eight-card hand and scored the same way; the higher round score earns a five-point bonus.\n\nSix rounds are played. Most rounds you will see one or two partial sets but rarely a full family. A typical run scores around sixty to ninety points; ninety-plus represents a notably lucky deal. There are no decisions to make — Happy Families is a deal-and-watch game, perfect for a coffee break.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HappyFamiliesShedSettings),
  reducer, isTerminal, component: HappyFamiliesShedGame,
};
