import type React from "react";

export type Seat = 0 | 1 | 2 | 3;

export type SettingField =
  | { kind: "number"; label: string; min: number; max: number; step?: number; default: number }
  | { kind: "enum"; label: string; options: readonly string[]; default: string }
  | { kind: "boolean"; label: string; default: boolean };

export type SettingSchema = Record<string, SettingField>;

export type SettingsOf<S extends SettingSchema> = {
  [K in keyof S]: S[K] extends { kind: "number" } ? number
    : S[K] extends { kind: "enum"; options: readonly (infer O)[] } ? O
    : S[K] extends { kind: "boolean" } ? boolean
    : never;
};

export interface GameProps<State, Settings> {
  state: State;
  settings: Settings;
  dispatch: (action: unknown) => void;
  onGameOver: (score: number) => void;
  /** Current RNG seed for this run. Optional so existing games keep compiling. */
  seed?: number;
}

export type GameCategory = "solitaire" | "cards" | "dice" | "board" | "arcade";

/** A hint suggestion. `message` is shown in a toast. Optional fields support
 *  UI affordances:
 *    - `eliminatedChoice` (quiz): a wrong choice index to gray-out
 *    - `revealedIndex` (sudoku/grid): a cell index to highlight
 */
export interface GameHint {
  message: string;
  eliminatedChoice?: number;
  revealedIndex?: number;
}

/** A DOM-pulse hint target. The hint button on PlayPage queries the
 *  document for `selector` and adds a brief pulsing outline to the first
 *  match. `pulses` defaults to 3 (~1.5s). Read-only — never mutates state. */
export interface HintTarget {
  selector: string;
  pulses?: number;
}

export interface GamePlugin<State = unknown, Action = unknown, Schema extends SettingSchema = SettingSchema> {
  id: string;
  title: string;
  category: GameCategory;
  players: { min: number; max: number; multiplayer: boolean };
  description: string;
  howToPlay?: string;   // optional — markdown-ish plain text, paragraphs separated by \n\n

  settings: Schema;
  initialState: (seed: number, settings: SettingsOf<Schema>) => State;
  reducer: (state: State, action: Action) => State;
  isTerminal: (state: State) => { score: number } | null;

  /** Optional hint generator. Returns a suggested move/clue, or null if none. */
  getHint?: (state: State, settings: SettingsOf<Schema>) => GameHint | null;

  /** Optional DOM-pulse hint. Returns a CSS selector to pulse, or null
   *  if no hint is available. Strictly read-only — must never mutate
   *  state. Used by PlayPage's Hint button to highlight the most
   *  plausible next move/control. */
  hint?: (state: State) => HintTarget | null;

  /** The play surface React component. Either an eagerly imported `FC` or
   *  a `React.lazy()` wrapper. Lazy wrappers let each game's `Game.tsx`
   *  module split out of the main JS chunk; PlayPage already wraps the
   *  render site in `<Suspense>` so the skeleton fallback covers loading. */
  component:
    | React.FC<GameProps<State, SettingsOf<Schema>>>
    | React.LazyExoticComponent<React.ComponentType<unknown>>;

  /** Optional per-game CSS variable overrides for the play surface. When
   *  present, PlayPage scopes these onto the `.play-page` wrapper (NOT
   *  `:root`) so the override is contained to this game and does not bleed
   *  into the rest of the app or the user's selected ThemePicker theme.
   *  Variable names match the global theme system: `--theme-felt`,
   *  `--theme-accent`, `--theme-bg`. Engine wraps that read those vars
   *  (e.g. `var(--theme-felt, ...)`) automatically pick up the override.
   */
  themeOverrides?: {
    feltGradient?: string;
    accent?: string;
    bgGradient?: string;
  };
}

export function defaultsOf<S extends SettingSchema>(schema: S): SettingsOf<S> {
  const out = {} as Record<string, unknown>;
  for (const [key, field] of Object.entries(schema)) out[key] = field.default;
  return out as SettingsOf<S>;
}
