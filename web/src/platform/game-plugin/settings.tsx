import type { SettingSchema, SettingsOf } from "./types.js";

interface Props<S extends SettingSchema> {
  schema: S;
  values: SettingsOf<S>;
  onChange: (key: keyof S, value: unknown) => void;
}

/**
 * Many plugin scaffolds declare a placeholder `{ _dummy: boolean }` or
 * `{ dummy: boolean }` setting that has no game effect — it exists only
 * to satisfy the type constraint. Hide those rows so the play page
 * doesn't surface a confusing "dummy" checkbox.
 */
function isPlaceholderField(key: string, label: string): boolean {
  const k = key.toLowerCase();
  const l = label.toLowerCase().trim();
  if (k === "dummy" || k === "_dummy" || k === "placeholder") return true;
  if (l === "dummy" || l === "_" || l === "placeholder") return true;
  return false;
}

export function SettingsForm<S extends SettingSchema>({ schema, values, onChange }: Props<S>): JSX.Element {
  return (
    <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
      {Object.entries(schema).map(([key, field]) => {
        if (isPlaceholderField(key, field.label)) return null;
        if (field.kind === "number") {
          return (
            <label key={key} title={field.label}>
              <span>{field.label}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                value={(values as Record<string, number>)[key]}
                onChange={(e) => onChange(key, Number(e.target.value))}
                title={`${field.label}: integer between ${field.min} and ${field.max}`}
              />
            </label>
          );
        }
        if (field.kind === "enum") {
          return (
            <label key={key} title={field.label}>
              <span>{field.label}</span>
              <select
                value={String((values as Record<string, string>)[key])}
                onChange={(e) => onChange(key, e.target.value)}
                title={`${field.label}: choose one of ${field.options.join(", ")}`}
              >
                {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          );
        }
        return (
          <label key={key} className="boolean" title={field.label}>
            <input
              type="checkbox"
              checked={(values as Record<string, boolean>)[key]}
              onChange={(e) => onChange(key, e.target.checked)}
              title={`Toggle ${field.label}`}
            />
            <span>{field.label}</span>
          </label>
        );
      })}
    </form>
  );
}
