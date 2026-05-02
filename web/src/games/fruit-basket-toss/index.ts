import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FruitBasketTossState, FruitBasketTossAction, FruitBasketTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FruitBasketTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fruitBasketTossPlugin: GamePlugin<FruitBasketTossState, FruitBasketTossAction, typeof settings> = {
  id: "fruit-basket-toss", title: "Fruit Basket Toss", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Toss a full fruit basket at just the right power to land it perfectly on the table!",
  howToPlay: `Fruit Basket Toss is a power-accuracy game. Each round you launch a basket of fresh fruit toward a table. Set your power slider and press Go! — the basket lands closer or farther based on your power. Closer to the target earns more points. 10 tosses for a full score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as FruitBasketTossSettings),
  reducer, isTerminal,
    hint: (state: FruitBasketTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-fruit-basket-toss-action"]', pulses: 3 };
    },
  component: FruitBasketTossGame,
};
