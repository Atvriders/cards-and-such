import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SettingsPage.css";

type CardBack = "classic-blue" | "red-weave" | "plain";
type Animations = "full" | "reduced" | "off";
type CardFont = "serif" | "modern";

const LS_CARD_BACK = "cards-card-back";
const LS_SOUND = "cards-sound-on";
const LS_SOUND_LEGACY = "cards-sound-enabled";
const LS_ANIMATIONS = "cards-animations";
const LS_CARD_FONT = "cards-card-font";

const CARD_BACKS: { id: CardBack; label: string; preview: string }[] = [
  {
    id: "classic-blue",
    label: "Classic Blue Weave",
    preview:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "radial-gradient(circle at 50% 50%, #5b59d9 0%, #3b3aa3 78%)",
  },
  {
    id: "red-weave",
    label: "Red Weave",
    preview:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "radial-gradient(circle at 50% 50%, #d44848 0%, #8a1f1f 78%)",
  },
  {
    id: "plain",
    label: "Plain",
    preview: "linear-gradient(180deg, #2a2f45 0%, #1a1d2c 100%)",
  },
];

function readCardBack(): CardBack {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_CARD_BACK)) as CardBack | null;
  return v === "red-weave" || v === "plain" || v === "classic-blue" ? v : "classic-blue";
}
function readSound(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem(LS_SOUND);
  if (v !== null) return v === "true";
  const legacy = localStorage.getItem(LS_SOUND_LEGACY);
  return legacy === null ? true : legacy === "true";
}
function readAnimations(): Animations {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_ANIMATIONS)) as Animations | null;
  return v === "reduced" || v === "off" || v === "full" ? v : "full";
}
function readCardFont(): CardFont {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_CARD_FONT)) as CardFont | null;
  return v === "serif" || v === "modern" ? v : "modern";
}

export function applyCardBack(id: CardBack): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-card-back", id);
}
export function applyAnimations(mode: Animations): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-animations", mode);
}
export function applyCardFont(font: CardFont): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-card-font", font);
}

/** Read all preferences from localStorage and apply to <html>. Call once at app start. */
export function applySavedPreferences(): void {
  applyCardBack(readCardBack());
  applyAnimations(readAnimations());
  applyCardFont(readCardFont());
}

export default function SettingsPage(): JSX.Element {
  const [cardBack, setCardBack] = useState<CardBack>(readCardBack);
  const [sound, setSound] = useState<boolean>(readSound);
  const [animations, setAnimations] = useState<Animations>(readAnimations);
  const [cardFont, setCardFont] = useState<CardFont>(readCardFont);

  useEffect(() => {
    localStorage.setItem(LS_CARD_BACK, cardBack);
    applyCardBack(cardBack);
  }, [cardBack]);
  useEffect(() => {
    localStorage.setItem(LS_SOUND, String(sound));
  }, [sound]);
  useEffect(() => {
    localStorage.setItem(LS_ANIMATIONS, animations);
    applyAnimations(animations);
  }, [animations]);
  useEffect(() => {
    localStorage.setItem(LS_CARD_FONT, cardFont);
    applyCardFont(cardFont);
  }, [cardFont]);

  function resetAll() {
    localStorage.removeItem(LS_CARD_BACK);
    localStorage.removeItem(LS_SOUND);
    localStorage.removeItem(LS_SOUND_LEGACY);
    localStorage.removeItem(LS_ANIMATIONS);
    localStorage.removeItem(LS_CARD_FONT);
    localStorage.removeItem("cards-bg-theme");
    setCardBack("classic-blue");
    setSound(true);
    setAnimations("full");
    setCardFont("modern");
    applyCardBack("classic-blue");
    applyAnimations("full");
    applyCardFont("modern");
  }

  return (
    <div className="settings-page" data-testid="settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>Background theme</h2>
        <p className="settings-hint">
          Pick a felt-table background from the palette button in the header, or
          {" "}<Link to="/" className="settings-link">return to the lobby</Link>.
        </p>
      </section>

      <section className="settings-section">
        <h2>Card-back style</h2>
        <div className="settings-row" role="radiogroup" aria-label="Card-back style">
          {CARD_BACKS.map((b) => (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={cardBack === b.id}
              className={`card-back-swatch${cardBack === b.id ? " is-selected" : ""}`}
              onClick={() => setCardBack(b.id)}
              data-testid={`card-back-${b.id}`}
            >
              <span className="card-back-preview" style={{ background: b.preview }} aria-hidden="true" />
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>Sound</h2>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => setSound(e.target.checked)}
            data-testid="sound-toggle"
          />
          <span>{sound ? "Sound on" : "Sound off"}</span>
        </label>
      </section>

      <section className="settings-section">
        <h2>Animations</h2>
        <div className="settings-row" role="radiogroup" aria-label="Animations">
          {(["full", "reduced", "off"] as Animations[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={animations === m}
              className={`pill${animations === m ? " is-selected" : ""}`}
              onClick={() => setAnimations(m)}
              data-testid={`animations-${m}`}
            >
              {m === "full" ? "Full" : m === "reduced" ? "Reduced" : "Off"}
            </button>
          ))}
        </div>
        <p className="settings-hint">Reduced/off matches the <code>prefers-reduced-motion</code> behavior.</p>
      </section>

      <section className="settings-section">
        <h2>Card font</h2>
        <div className="settings-row" role="radiogroup" aria-label="Card font">
          <button
            type="button"
            role="radio"
            aria-checked={cardFont === "serif"}
            className={`pill${cardFont === "serif" ? " is-selected" : ""}`}
            onClick={() => setCardFont("serif")}
            data-testid="card-font-serif"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Serif (Georgia)
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={cardFont === "modern"}
            className={`pill${cardFont === "modern" ? " is-selected" : ""}`}
            onClick={() => setCardFont("modern")}
            data-testid="card-font-modern"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Modern (Inter)
          </button>
        </div>
      </section>

      <section className="settings-section">
        <button type="button" className="reset-btn" onClick={resetAll} data-testid="reset-prefs">
          Reset all preferences
        </button>
      </section>
    </div>
  );
}
