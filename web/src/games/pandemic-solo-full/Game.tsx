import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  ADJACENCY,
  CITIES,
  COLORS,
  CUBES_PER_COLOR,
  INFECTION_RATES,
  OUTBREAK_LOSS,
  ROLE_INFO,
  curesCount,
  currentRate,
  hasStation,
  isTerminal,
  reducer,
  totalCubes,
} from "./state.js";
import type {
  DiseaseColor,
  PandemicSoloFullAction,
  PandemicSoloFullState,
} from "./state.js";
import "./Game.css";

type Props = GameProps<PandemicSoloFullState, { difficulty: "introductory" | "standard" | "heroic"; roleCount: number }>;

const COLOR_HEX: Record<DiseaseColor, string> = {
  blue: "#3da9fc",
  yellow: "#facc15",
  black: "#1f1f29",
  red: "#ef4444",
};

const COLOR_BG: Record<DiseaseColor, string> = {
  blue: "rgba(61,169,252,0.18)",
  yellow: "rgba(250,204,21,0.18)",
  black: "rgba(31,31,41,0.30)",
  red: "rgba(239,68,68,0.18)",
};

export function PandemicSoloFullGame(props: unknown): JSX.Element {
  const p = props as Props;
  const { state, dispatch, onGameOver } = p;

  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const send = useCallback((a: PandemicSoloFullAction) => dispatch(a), [dispatch]);

  const active = state.pawns[state.current];
  const [selectedColor, setSelectedColor] = useState<DiseaseColor | null>(null);
  const [pickerMode, setPickerMode] = useState<"none" | "drive" | "direct" | "charter" | "shuttle" | "share" | "cure">("none");
  const [cureSelected, setCureSelected] = useState<number[]>([]);
  const [shareTarget, setShareTarget] = useState<number | null>(null);

  const curesDone = curesCount(state);
  const term = isTerminal(state);

  const onCityClick = useCallback((cityId: number) => {
    if (!active) return;
    if (pickerMode === "drive") {
      send({ type: "drive", toCityId: cityId });
      setPickerMode("none");
      return;
    }
    if (pickerMode === "direct") {
      send({ type: "direct_flight", toCityId: cityId });
      setPickerMode("none");
      return;
    }
    if (pickerMode === "charter") {
      send({ type: "charter_flight", toCityId: cityId });
      setPickerMode("none");
      return;
    }
    if (pickerMode === "shuttle") {
      send({ type: "shuttle_flight", toCityId: cityId });
      setPickerMode("none");
      return;
    }
  }, [active, pickerMode, send]);

  const onTreat = useCallback(() => {
    if (!active) return;
    const here = state.cityCubes[active.cityId]!;
    const colorChoice: DiseaseColor | null =
      selectedColor && here[colorIdx(selectedColor)]! > 0
        ? selectedColor
        : (COLORS.find((c) => here[colorIdx(c)]! > 0) ?? null);
    if (!colorChoice) return;
    send({ type: "treat", color: colorChoice });
  }, [active, selectedColor, state.cityCubes, send]);

  const onBuild = useCallback(() => send({ type: "build_station" }), [send]);

  const onShareInit = useCallback(() => {
    setPickerMode("share");
    setShareTarget(null);
  }, []);

  const completeShare = useCallback((toIdx: number) => {
    if (!active) return;
    send({
      type: "share_knowledge",
      cityId: active.cityId,
      giverIdx: state.current,
      receiverIdx: toIdx,
    });
    setShareTarget(null);
    setPickerMode("none");
  }, [active, state.current, send]);

  const onCureInit = useCallback(() => {
    setPickerMode("cure");
    setCureSelected([]);
  }, []);

  const toggleCureCard = useCallback((cardCityId: number) => {
    setCureSelected((prev) =>
      prev.includes(cardCityId) ? prev.filter((x) => x !== cardCityId) : prev.concat([cardCityId]),
    );
  }, []);

  const submitCure = useCallback(() => {
    if (!active || !selectedColor) return;
    send({ type: "discover_cure", color: selectedColor, cardCityIds: cureSelected });
    setCureSelected([]);
    setPickerMode("none");
  }, [active, selectedColor, cureSelected, send]);

  const onPass = useCallback(() => send({ type: "pass" }), [send]);

  const onSwitchRole = useCallback((idx: number) => {
    send({ type: "activate_role", pawnIdx: idx });
  }, [send]);

  // Compute SVG viewport size from CITIES bounding box (with margin).
  const viewBox = "0 0 1010 560";

  // Build edges list once.
  const edges = useMemo(() => {
    const list: Array<{ a: number; b: number }> = [];
    for (let i = 0; i < CITIES.length; i++) {
      for (const n of ADJACENCY[i]!) {
        if (i < n) list.push({ a: i, b: n });
      }
    }
    return list;
  }, []);

  const cubeCountsByColor: Record<DiseaseColor, number> = state.cubes;
  const rate = currentRate(state);

  return (
    <div className="psf-wrap fade-in" data-testid="psf-root">
      <header className="psf-top">
        <div className="psf-top-block">
          <span className="psf-top-label">Cures</span>
          <span className="psf-top-value pulse" data-testid="psf-cures">{curesDone}/4</span>
        </div>
        <div className="psf-top-block">
          <span className="psf-top-label">Outbreaks</span>
          <span className="psf-top-value" data-testid="psf-outbreaks">{state.outbreaks}/{OUTBREAK_LOSS - 1}</span>
        </div>
        <div className="psf-top-block">
          <span className="psf-top-label">Infection rate</span>
          <span className="psf-top-value" data-testid="psf-rate">{rate}</span>
        </div>
        <div className="psf-top-block">
          <span className="psf-top-label">Player deck</span>
          <span className="psf-top-value" data-testid="psf-deck">{state.playerDeck.length}</span>
        </div>
        <div className="psf-top-block">
          <span className="psf-top-label">Actions left</span>
          <span className="psf-top-value" data-testid="psf-actions">{state.actionsLeft}</span>
        </div>
      </header>

      <div className="psf-cube-row">
        {COLORS.map((c) => (
          <span
            key={c}
            className="psf-cube-pill"
            style={{ background: COLOR_BG[c], borderColor: COLOR_HEX[c] }}
            title={`${cubeCountsByColor[c]} of ${CUBES_PER_COLOR} cubes left${state.cured[c] ? " (CURED)" : ""}`}
          >
            <span className="psf-cube-dot" style={{ background: COLOR_HEX[c] }} />
            {cubeCountsByColor[c]} {state.cured[c] && <span className="psf-cured-tag">CURED</span>}
          </span>
        ))}
      </div>

      <div className="psf-status" data-testid="psf-status">{state.lastEvent}</div>

      <div className="psf-board-wrap">
        <svg viewBox={viewBox} className="psf-board" data-testid="psf-board" role="img" aria-label="Pandemic world map">
          <rect x={0} y={0} width={1010} height={560} fill="url(#psf-ocean)" />
          <defs>
            <radialGradient id="psf-ocean" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#0d2138" />
              <stop offset="100%" stopColor="#040912" />
            </radialGradient>
          </defs>
          {edges.map((e, i) => {
            const A = CITIES[e.a]!;
            const B = CITIES[e.b]!;
            return (
              <line
                key={i}
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke="rgba(255,255,255,0.15)" strokeWidth={1.2}
              />
            );
          })}
          {CITIES.map((c) => {
            const counts = state.cityCubes[c.id]!;
            const isStation = hasStation(state, c.id);
            const tc = totalCubes(state, c.id);
            const pawnHere = state.pawns
              .map((p, i) => ({ p, i }))
              .filter((q) => q.p.cityId === c.id);
            const isPickable =
              (pickerMode === "drive" && ADJACENCY[active?.cityId ?? -1]?.includes(c.id)) ||
              (pickerMode === "direct" && active?.hand.some((card) => card.kind === "city" && card.cityId === c.id)) ||
              (pickerMode === "charter" && c.id !== active?.cityId && active?.hand.some((card) => card.kind === "city" && card.cityId === active.cityId)) ||
              (pickerMode === "shuttle" && isStation && hasStation(state, active?.cityId ?? -1) && c.id !== active?.cityId);
            return (
              <g
                key={c.id}
                className={`psf-city ${isPickable ? "psf-city-pickable" : ""}`}
                onClick={() => onCityClick(c.id)}
                data-testid={`psf-city-${c.id}`}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={11}
                  fill={COLOR_HEX[c.color]}
                  stroke={isStation ? "#fff" : "rgba(255,255,255,0.4)"}
                  strokeWidth={isStation ? 3 : 1}
                />
                {tc > 0 && (
                  <g>
                    {counts.map((n, ci) =>
                      n > 0 ? (
                        <text
                          key={ci}
                          x={c.x + (ci - 1.5) * 9}
                          y={c.y - 16}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={700}
                          fill={COLOR_HEX[COLORS[ci]!]}
                          stroke="#000"
                          strokeWidth={0.6}
                        >
                          {n}
                        </text>
                      ) : null,
                    )}
                  </g>
                )}
                {pawnHere.map((q, k) => (
                  <circle
                    key={q.i}
                    cx={c.x - 14 + k * 8}
                    cy={c.y + 16}
                    r={5}
                    fill={q.i === state.current ? "#fff" : "rgba(255,255,255,0.55)"}
                    stroke="#000"
                    strokeWidth={1.2}
                  />
                ))}
                <text x={c.x} y={c.y - 24} textAnchor="middle" fontSize={9} fill="#e6f0ff" style={{ pointerEvents: "none" }}>
                  {c.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="psf-roles">
        {state.pawns.map((pw, idx) => (
          <button
            key={idx}
            type="button"
            className={`psf-role ${idx === state.current ? "psf-role-active" : ""}`}
            onClick={() => onSwitchRole(idx)}
            disabled={idx === state.current || state.phase !== "action"}
            title={ROLE_INFO[pw.role].blurb}
            data-testid={`psf-role-${idx}`}
          >
            <span className="psf-role-name">{ROLE_INFO[pw.role].label}</span>
            <span className="psf-role-city">{CITIES[pw.cityId]!.name}</span>
            <span className="psf-role-hand">Hand: {pw.hand.length}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="psf-hand-bar" data-testid="psf-hand">
          <span className="psf-hand-label">{ROLE_INFO[active.role].label}'s hand:</span>
          {active.hand.length === 0 && <span className="psf-hand-empty">Empty</span>}
          {active.hand.map((c, i) => {
            const isCity = c.kind === "city";
            const cityId = isCity ? c.cityId : -1;
            const colorOf: DiseaseColor | null = isCity ? CITIES[cityId]!.color : null;
            const selected = pickerMode === "cure" && cureSelected.includes(cityId);
            return (
              <button
                key={i}
                type="button"
                className={`psf-card ${selected ? "psf-card-selected" : ""}`}
                style={isCity && colorOf ? { background: COLOR_BG[colorOf], borderColor: COLOR_HEX[colorOf] } : undefined}
                onClick={() => {
                  if (pickerMode === "cure" && isCity) toggleCureCard(cityId);
                }}
                title={isCity ? `${CITIES[cityId]!.name} (${colorOf})` : c.kind === "event" ? "Event card (no effect in solo)" : "EPIDEMIC"}
              >
                {isCity ? CITIES[cityId]!.name : c.kind === "event" ? "Event" : "Epidemic"}
              </button>
            );
          })}
        </div>
      )}

      <div className="psf-actions" role="toolbar" aria-label="Actions">
        <button type="button" onClick={() => setPickerMode("drive")} disabled={state.phase !== "action"} title="Move to an adjacent city" data-testid="psf-action-drive">
          Drive ({pickerMode === "drive" ? "pick city" : "1"})
        </button>
        <button type="button" onClick={() => setPickerMode("direct")} disabled={state.phase !== "action"} title="Discard a city card to fly there" data-testid="psf-action-direct">
          Direct flight
        </button>
        <button type="button" onClick={() => setPickerMode("charter")} disabled={state.phase !== "action"} title="Discard current city card to fly anywhere" data-testid="psf-action-charter">
          Charter
        </button>
        <button type="button" onClick={() => setPickerMode("shuttle")} disabled={state.phase !== "action"} title="Move between research stations" data-testid="psf-action-shuttle">
          Shuttle
        </button>
        <button type="button" onClick={onBuild} disabled={state.phase !== "action"} title="Build a research station (discard current city card)" data-testid="psf-action-build">
          Build station
        </button>
        <button type="button" onClick={onTreat} disabled={state.phase !== "action"} title="Treat disease — Medic clears all cubes of the color" data-testid="psf-action-treat">
          Treat {selectedColor ? `(${selectedColor})` : ""}
        </button>
        <button type="button" onClick={onShareInit} disabled={state.phase !== "action" || state.pawns.length < 2} title="Share current-city card with another role here" data-testid="psf-action-share">
          Share
        </button>
        <button type="button" onClick={onCureInit} disabled={state.phase !== "action" || !hasStation(state, active?.cityId ?? -1)} title="Discover a cure at a research station" data-testid="psf-action-cure">
          Cure
        </button>
        <button type="button" onClick={onPass} disabled={state.phase !== "action"} title="End your turn now" data-testid="psf-action-pass">
          Pass
        </button>
      </div>

      {pickerMode === "cure" && (
        <div className="psf-cure-panel" data-testid="psf-cure-panel">
          <span>Pick disease color, then select matching cards from your hand:</span>
          <div className="psf-color-row">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                disabled={state.cured[c]}
                className={`psf-color-btn ${selectedColor === c ? "psf-color-btn-active" : ""}`}
                style={{ background: COLOR_HEX[c] }}
                title={`Cure ${c}${state.cured[c] ? " (already cured)" : ""}`}
                aria-label={`Choose ${c}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div>
            Selected: {cureSelected.length}{" "}
            (need {active?.role === "scientist" ? 4 : 5})
          </div>
          <button type="button" onClick={submitCure} disabled={!selectedColor || cureSelected.length < (active?.role === "scientist" ? 4 : 5)} title="Submit cure attempt">
            Submit cure
          </button>
          <button type="button" onClick={() => { setPickerMode("none"); setCureSelected([]); }} title="Cancel cure">
            Cancel
          </button>
        </div>
      )}

      {pickerMode === "share" && (
        <div className="psf-share-panel" data-testid="psf-share-panel">
          <span>Pick role to receive the {active ? CITIES[active.cityId]!.name : ""} card:</span>
          {state.pawns.map((pw, idx) => {
            if (idx === state.current) return null;
            const sameCity = pw.cityId === active?.cityId;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => completeShare(idx)}
                disabled={!sameCity}
                title={sameCity ? `Share with ${ROLE_INFO[pw.role].label}` : `${ROLE_INFO[pw.role].label} is in another city`}
              >
                {ROLE_INFO[pw.role].label} ({CITIES[pw.cityId]!.name})
              </button>
            );
          })}
          <button type="button" onClick={() => setPickerMode("none")} title="Cancel share">Cancel</button>
          {shareTarget !== null && <span>Target: {shareTarget}</span>}
        </div>
      )}

      <div className="psf-treat-panel">
        <span className="psf-treat-label">Treat color:</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedColor(c)}
            className={`psf-color-btn ${selectedColor === c ? "psf-color-btn-active" : ""}`}
            style={{ background: COLOR_HEX[c] }}
            title={`Select ${c} for treatment`}
            aria-label={`Pick ${c}`}
          >
            {c}
          </button>
        ))}
      </div>

      {term && (
        <div className="psf-end bounce-in" data-testid="psf-end">
          <h3>{state.phase === "won" ? "Victory!" : "Defeat"}</h3>
          <p>{state.phase === "won" ? `All four diseases cured.` : state.loseReason ?? "Game over."}</p>
          <p>Final score: {term.score}</p>
        </div>
      )}

      <details className="psf-rules">
        <summary>Difficulty: {state.settings.difficulty} ({state.settings.roleCount} roles, {INFECTION_RATES[state.infectionRateIdx]} infections/turn)</summary>
        <p>Spend 4 actions, draw 2 player cards (epidemics raise the rate), infect cities at the rate. Win by curing all four diseases.</p>
      </details>
    </div>
  );
}

function colorIdx(c: DiseaseColor): number {
  return c === "blue" ? 0 : c === "yellow" ? 1 : c === "black" ? 2 : 3;
}

// Reducer ref so plugin's reducer is imported (silence unused-warnings if any).
void reducer;
