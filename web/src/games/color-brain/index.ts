import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorBrainState, ColorBrainAction, ColorBrainSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColorBrainGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const colorBrainPlugin: GamePlugin<ColorBrainState, ColorBrainAction, typeof settings> = {
  id: "color-brain", title: "Color Brain", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia where every answer is a color.",
  howToPlay: "Color Brain is trivia where every answer is a color. Fifteen rounds each pose a question — what color is a stop sign, a pumpkin, fresh snow, an avocado peel, a flamingo? — and present four candidate colors. Pick the right one, hit Submit, score ten points. Max 150 points across fifteen rounds. The full pool covers everyday objects (buses, basketballs, eggplants), weather (sky, snow), animals (flamingos, polar bears), and traffic (stop and go signals). Color Brain rewards observational fluency — knowing the world's colors as you have actually seen them. Children playing score 90-130; adults often get 130-150. The trick is that obvious answers stay obvious — no trick questions. Hit Submit to lock and Next to advance. Useful as a kids learning game, an icebreaker, or as a five-minute palette-check before doing visual creative work. A perfect score certifies you as a color-pattern observer of the everyday.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ColorBrainSettings),
  reducer, isTerminal, component: ColorBrainGame,
};
