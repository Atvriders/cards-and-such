import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongTortoiseShellGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongTortoiseShellGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongTortoiseShellPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-tortoise-shell",
  title: "Mahjong Tortoise Shell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a tortoise body with a domed multi-layer shell.",
  howToPlay: "Mahjong Tortoise Shell is a Mahjong solitaire layout shaped like a slow, sun-warmed tortoise with a small head and tail and a high three-layer dome rising from the centre of the carapace. The wide flat ring forms the body and limbs, while the dome rises layer-by-layer at the centre.\n\nFree tiles glow brightly. To remove a pair, click a free tile to highlight it, then click any other free tile bearing the same face. The pair vanishes and previously buried tiles often become accessible.\n\nThe shell's stacked dome is the main strategic problem here: tiles on the top of the dome must be peeled before any neighbouring lower-layer tile can be reached, so plan your clears top-down through the centre while keeping the rim of the body in reserve. A complete clear scores up to ten thousand points minus fifty per move; partial clears earn a smaller proportional score for tiles removed.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongTortoiseShellGame,
};
