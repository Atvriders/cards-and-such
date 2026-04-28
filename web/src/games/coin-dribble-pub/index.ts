import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoinDribbleState, CoinDribbleAction, CoinDribbleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoinDribbleGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const coinDribblePlugin: GamePlugin<CoinDribbleState, CoinDribbleAction, typeof settings> = {
  id: "coin-dribble-pub",
  title: "Coin Dribble",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push coin along bar surface. Land in score zone.",
  howToPlay: "Coin Dribble is the bar-surface dexterity game where you push a coin along the polished wood between finger-guides into a target zone at the far end. Too soft and the coin stops short; too hard and it flies off. In this digital version, each turn you press Dribble and a precision-roll determines where your coin lands: 5% bullseye (20 points), descending tiers down to a complete miss (0). Across ten turns, average totals are 60-90 with great runs above 130. Press Next after the throw resolves to advance. The pub original is a slow, deliberate game played on long counter-tops, traditionally between sips of pints. Each push is judged for arc, weight, and timing. The digital version captures the satisfying randomness of a real coin slide without the actual finger work. Score equals total points after ten dribbles.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoinDribbleSettings),
  reducer,
  isTerminal,
  component: CoinDribbleGame,
};
