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
}

export type GameCategory = "solitaire" | "cards" | "dice" | "board" | "arcade";

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

  component: React.FC<GameProps<State, SettingsOf<Schema>>>;
}

export function defaultsOf<S extends SettingSchema>(schema: S): SettingsOf<S> {
  const out = {} as Record<string, unknown>;
  for (const [key, field] of Object.entries(schema)) out[key] = field.default;
  return out as SettingsOf<S>;
}
