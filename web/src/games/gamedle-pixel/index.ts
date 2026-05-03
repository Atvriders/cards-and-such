import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GamedlePixelState, GamedlePixelAction, GamedlePixelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GamedlePixelGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gamedlePixelPlugin: GamePlugin<GamedlePixelState, GamedlePixelAction, typeof settings> = {
  id: "gamedle-pixel", title: "Gamedle Pixel", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify video games from pixel-art descriptions.",
  howToPlay: "Gamedle Pixel tests video-game identification by visual-style description. Each of fifteen rounds describes a game's iconic visual ('Plumber jumping on turtles', 'Yellow circle eating dots', 'Falling tetromino blocks') and asks which title matches. Pick from four candidates, hit Submit, score ten points. Max 150 across fifteen rounds. The game pool spans Super Mario Bros, Kirby, Zelda, Pac-Man, Tetris, Crash Bandicoot, Sonic, Mario Kart, Pokemon, Minecraft, Cyberpunk 2077, DOOM, Donkey Kong, Star Fox, and Dark Souls — classics across six decades of gaming. Gaming fans hit 130+; casual players 80-110. The original online Gamedle reveals pixel art progressively; this textual version captures the same identification challenge. Distractor titles come from the same pool. Hit Submit and Next. Total run takes about a minute and a half. A perfect score certifies broad gaming literacy across console eras.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GamedlePixelSettings),
  reducer, isTerminal, hint: (state: GamedlePixelState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-gamedle-pixel-answer-0"]', pulses: 3 } : null, component: GamedlePixelGame,
};
