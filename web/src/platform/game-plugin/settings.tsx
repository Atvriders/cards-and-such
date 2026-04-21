import type { SettingSchema, SettingsOf } from "./types.js";

interface Props<S extends SettingSchema> {
  schema: S;
  values: SettingsOf<S>;
  onChange: (key: keyof S, value: unknown) => void;
}

export function SettingsForm<S extends SettingSchema>({ schema, values, onChange }: Props<S>): JSX.Element {
  return (
    <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
      {Object.entries(schema).map(([key, field]) => {
        if (field.kind === "number") {
          return (
            <label key={key}>
              <span>{field.label}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                value={(values as Record<string, number>)[key]}
                onChange={(e) => onChange(key, Number(e.target.value))}
              />
            </label>
          );
        }
        if (field.kind === "enum") {
          return (
            <label key={key}>
              <span>{field.label}</span>
              <select
                value={String((values as Record<string, string>)[key])}
                onChange={(e) => onChange(key, e.target.value)}
              >
                {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          );
        }
        return (
          <label key={key} className="boolean">
            <input
              type="checkbox"
              checked={(values as Record<string, boolean>)[key]}
              onChange={(e) => onChange(key, e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        );
      })}
    </form>
  );
}
