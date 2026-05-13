import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  ADJACENCY,
  CITIES,
  COLORS,
  ROLE_INFO,
  currentPawn,
  infectionRate,
  isTerminal,
  totalCubesInCity,
} from "./state.js";
import type { DiseaseColor, PandemicFullAction, PandemicFullState, PandemicFullSettings, PlayerCard } from "./state.js";
import "./Game.css";

interface Props extends GameProps<PandemicFullState, PandemicFullSettings> {}

const COLOR_HEX: Record<DiseaseColor, string> = {
  blue: "#3b82f6",
  yellow: "#eab308",
  black: "#374151",
  red: "#ef4444",
};

const COLOR_LABEL: Record<DiseaseColor, string> = {
  blue: "Blue",
  yellow: "Yellow",
  black: "Black",
  red: "Red",
};

export function PandemicFull(props: Props): JSX.Element {
  const { state, dispatch, onGameOver } = props;
  const endedRef = useRef(false);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const pawn = currentPawn(state);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedCureCards, setSelectedCureCards] = useState<number[]>([]);
  const [cureColor, setCureColor] = useState<DiseaseColor>("blue");

  const status: string = useMemo(() => {
    if (state.phase === "won") return "Victory! All 4 cures discovered.";
    if (state.phase === "lost") return `Defeat: ${state.loseReason ?? "you lost."}`;
    return `${ROLE_INFO[pawn.role].label}'s turn — ${state.actionsLeft} action${state.actionsLeft === 1 ? "" : "s"} left.`;
  }, [state.phase, state.actionsLeft, state.loseReason, pawn.role]);

  const adjacent = ADJACENCY[pawn.cityId]!;
  const otherPawns = state.pawns.map((p, i) => ({ p, i })).filter(({ i }) => i !== state.current);
  const samePawnHere = otherPawns.find(({ p }) => p.cityId === pawn.cityId);
  const hasStationHere = state.stations.has(pawn.cityId);

  const sendDispatch = (a: PandemicFullAction): void => dispatch(a);

  function handleCityClick(cityId: number): void {
    if (state.phase !== "action") return;
    setSelectedCity(cityId);
    const pending = state.pendingAction;
    if (pending?.kind === "directFlight") {
      sendDispatch({ type: "directFlight", toCityId: cityId });
      return;
    }
    if (pending?.kind === "charterFlight") {
      sendDispatch({ type: "charterFlight", toCityId: cityId });
      return;
    }
    if (pending?.kind === "dispatcherMove") {
      sendDispatch({ type: "dispatcherMove", otherPawnIdx: pending.pawnIdx, toCityId: cityId });
      return;
    }
    // Default: try drive
    if (adjacent.includes(cityId) && state.actionsLeft > 0) {
      sendDispatch({ type: "drive", toCityId: cityId });
      return;
    }
    // Try shuttle
    if (hasStationHere && state.stations.has(cityId) && cityId !== pawn.cityId && state.actionsLeft > 0) {
      sendDispatch({ type: "shuttleFlight", toCityId: cityId });
      return;
    }
  }

  function startCure(): void {
    setSelectedCureCards([]);
    sendDispatch({ type: "setPending", pending: { kind: "discoverCure", color: cureColor, needed: pawn.role === "scientist" ? 4 : 5 } });
  }

  function toggleCureCard(idx: number): void {
    setSelectedCureCards((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : prev.concat([idx]));
  }

  function submitCure(): void {
    sendDispatch({ type: "discoverCure", color: cureColor, cardIds: selectedCureCards });
    setSelectedCureCards([]);
  }

  function handleShareSubmit(otherIdx: number, cityId: number): void {
    sendDispatch({ type: "shareKnowledge", otherPawnIdx: otherIdx, cityId });
  }

  const handForCure: PlayerCard[] = pawn.hand;

  // Compute SVG viewbox bounds
  const minX = 0, maxX = 1000, minY = 80, maxY = 540;
  const w = maxX - minX, h = maxY - minY;

  return (
    <div className="pf-root fade-in">
      <div className="pf-header">
        <div className={`pf-status${state.phase === "won" ? " win" : state.phase === "lost" ? " loss" : ""}`}>{status}</div>
        <div className="pf-meters pulse">
          <span className="pf-meter">Outbreaks: {state.outbreaks}/8</span>
          <span className="pf-meter">Infection rate: {infectionRate(state)}</span>
          <span className="pf-meter">Player deck: {state.playerDeck.length}</span>
          {COLORS.map((c) => (
            <span key={c} className="pf-meter" style={{ color: COLOR_HEX[c] }}>
              {COLOR_LABEL[c]}: {state.cubes[c]} {state.cured[c] ? "(cured)" : ""}
            </span>
          ))}
        </div>
        <div className="pf-event">{state.lastEvent}</div>
      </div>

      <div className="pf-map-wrap">
        <svg className="pf-map" viewBox={`${minX} ${minY} ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
          {/* edges */}
          {CITIES.map((c) =>
            ADJACENCY[c.id]!.filter((b) => b > c.id).map((b) => {
              const a = CITIES[c.id]!;
              const bb = CITIES[b]!;
              return (
                <line
                  key={`e-${c.id}-${b}`}
                  x1={a.x}
                  y1={a.y}
                  x2={bb.x}
                  y2={bb.y}
                  className="pf-edge"
                />
              );
            }),
          )}
          {/* cities */}
          {CITIES.map((c) => {
            const cubes = state.cityCubes[c.id]!;
            const isCurrentPawnHere = pawn.cityId === c.id;
            const station = state.stations.has(c.id);
            const isAdj = adjacent.includes(c.id);
            return (
              <g
                key={c.id}
                transform={`translate(${c.x}, ${c.y})`}
                onClick={() => handleCityClick(c.id)}
                className={`pf-city-g${isCurrentPawnHere ? " current" : ""}${isAdj ? " adjacent" : ""}${selectedCity === c.id ? " selected" : ""}`}
                data-testid={`pf-city-${c.id}`}
                style={{ cursor: state.phase === "action" ? "pointer" : "default" }}
              >
                <circle r={11} fill={COLOR_HEX[c.color]} stroke="#fff" strokeWidth={1.5} />
                {station && (
                  <rect x={-6} y={-22} width={12} height={12} fill="#fff" stroke="#222" strokeWidth={1} />
                )}
                {/* cubes by color */}
                {COLORS.map((col, i) => {
                  const cnt = cubes[i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : 3]!;
                  if (cnt <= 0) return null;
                  return (
                    <g key={col} transform={`translate(${14 + i * 9}, -4)`}>
                      <rect width={7} height={7} fill={COLOR_HEX[col]} stroke="#000" strokeWidth={0.5} />
                      <text x={3.5} y={6.2} fontSize={6} fill="#fff" textAnchor="middle">{cnt}</text>
                    </g>
                  );
                })}
                {/* pawn markers */}
                {state.pawns.map((p, idx) => p.cityId === c.id ? (
                  <circle
                    key={`p-${idx}`}
                    cx={-13 - idx * 6}
                    cy={-4}
                    r={4}
                    fill={idx === state.current ? "#fff" : "#cbd5e1"}
                    stroke={idx === state.current ? "#000" : "#475569"}
                    strokeWidth={1.5}
                  />
                ) : null)}
                <text y={26} textAnchor="middle" fontSize={9} className="pf-city-label">{c.name}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pf-actions">
        <div className="pf-pawns">
          {state.pawns.map((p, i) => (
            <div key={i} className={`pf-pawn${i === state.current ? " active" : ""}`}>
              <div className="pf-pawn-title">{ROLE_INFO[p.role].label}{i === state.current ? " (active)" : ""}</div>
              <div className="pf-pawn-loc">in {CITIES[p.cityId]!.name}</div>
              <div className="pf-hand">
                {p.hand.map((c, hi) => {
                  if (c.kind === "epidemic") {
                    return <span key={hi} className="pf-card pf-card-epi" title="Epidemic card (should never be in hand)">EPI</span>;
                  }
                  const city = CITIES[c.cityId]!;
                  const isCureCandidate = i === state.current
                    && state.pendingAction?.kind === "discoverCure"
                    && city.color === state.pendingAction.color;
                  return (
                    <button
                      key={hi}
                      className={`pf-card`}
                      style={{ background: COLOR_HEX[city.color], color: "#fff", outline: selectedCureCards.includes(hi) ? "3px solid #f0f" : "none" }}
                      title={`${city.name} (${COLOR_LABEL[city.color]})`}
                      onClick={() => {
                        if (isCureCandidate) toggleCureCard(hi);
                      }}
                      disabled={!isCureCandidate}
                    >
                      {city.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pf-buttons">
          {state.phase === "action" && (
            <>
              <button
                className="pf-btn"
                data-testid="pf-treat-btn"
                onClick={() => {
                  // Treat the first color with cubes here
                  const cubesHere = state.cityCubes[pawn.cityId]!;
                  for (let i = 0; i < 4; i++) {
                    if (cubesHere[i]! > 0) {
                      sendDispatch({ type: "treat", color: COLORS[i]! });
                      return;
                    }
                  }
                }}
                disabled={state.actionsLeft <= 0 || totalCubesInCity(state, pawn.cityId) === 0}
                title="Treat disease in your current city"
              >
                Treat Disease
              </button>
              <button
                className="pf-btn"
                onClick={() => {
                  if (state.stations.has(pawn.cityId)) return;
                  sendDispatch({ type: "buildStation" });
                }}
                disabled={state.actionsLeft <= 0 || state.stations.has(pawn.cityId)}
                title="Build a research station in your current city"
              >
                Build Station
              </button>
              <button
                className="pf-btn"
                onClick={() => sendDispatch({ type: "setPending", pending: { kind: "directFlight" } })}
                disabled={state.actionsLeft <= 0}
                title="Discard a city card to fly to that city"
              >
                Direct Flight…
              </button>
              <button
                className="pf-btn"
                onClick={() => sendDispatch({ type: "setPending", pending: { kind: "charterFlight" } })}
                disabled={state.actionsLeft <= 0 || !pawn.hand.some((c) => c.kind === "city" && c.cityId === pawn.cityId)}
                title="Discard the card of your current city to fly anywhere"
              >
                Charter Flight…
              </button>
              <button
                className="pf-btn"
                onClick={startCure}
                disabled={state.actionsLeft <= 0 || !hasStationHere}
                title="Discover a cure at a research station"
              >
                Discover Cure…
              </button>
              {samePawnHere && (
                <button
                  className="pf-btn"
                  onClick={() => sendDispatch({ type: "setPending", pending: { kind: "shareKnowledge" } })}
                  disabled={state.actionsLeft <= 0}
                  title="Share knowledge with another role in the same city"
                >
                  Share Knowledge…
                </button>
              )}
              {pawn.role === "dispatcher" && otherPawns.map(({ p, i }) => (
                <button
                  key={`disp-${i}`}
                  className="pf-btn"
                  onClick={() => sendDispatch({ type: "setPending", pending: { kind: "dispatcherMove", pawnIdx: i } })}
                  disabled={state.actionsLeft <= 0}
                  title={`Move the ${ROLE_INFO[p.role].label} pawn`}
                >
                  Dispatcher: move {ROLE_INFO[p.role].label}…
                </button>
              ))}
              <button
                className="pf-btn pf-pass"
                data-testid="pf-pass-btn"
                onClick={() => sendDispatch({ type: "pass" })}
                title="End your turn early; draw cards and infect"
              >
                Pass / End turn
              </button>
            </>
          )}
        </div>

        {state.pendingAction?.kind === "discoverCure" && (
          <div className="pf-pending">
            <div className="pf-pending-title">
              Choose color and pick {pawn.role === "scientist" ? 4 : 5} matching cards:
            </div>
            <div className="pf-color-pick">
              {COLORS.map((col) => (
                <button
                  key={col}
                  className="pf-btn pf-color-btn"
                  onClick={() => { setCureColor(col); setSelectedCureCards([]); sendDispatch({ type: "setPending", pending: { kind: "discoverCure", color: col, needed: pawn.role === "scientist" ? 4 : 5 } }); }}
                  style={{ background: COLOR_HEX[col], color: "#fff", outline: cureColor === col ? "3px solid #000" : "none" }}
                  title={`Cure ${COLOR_LABEL[col]} disease`}
                >
                  {COLOR_LABEL[col]}
                </button>
              ))}
            </div>
            <div className="pf-pending-actions">
              <button
                className="pf-btn"
                onClick={submitCure}
                disabled={selectedCureCards.length !== (pawn.role === "scientist" ? 4 : 5)}
                title="Submit the selected cards as your cure attempt"
              >
                Submit cure
              </button>
              <button
                className="pf-btn"
                onClick={() => { setSelectedCureCards([]); sendDispatch({ type: "setPending", pending: null }); }}
                title="Cancel cure selection"
              >
                Cancel
              </button>
            </div>
            <div className="pf-pending-hint">
              {selectedCureCards.length} / {pawn.role === "scientist" ? 4 : 5} selected — click cards in your hand above to toggle.
            </div>
            {/* Reference so handForCure is read; avoids unused variable warning */}
            <span hidden>{handForCure.length}</span>
          </div>
        )}

        {state.pendingAction?.kind === "shareKnowledge" && samePawnHere && (
          <div className="pf-pending">
            <div className="pf-pending-title">Share knowledge:</div>
            <div className="pf-pending-actions">
              <button
                className="pf-btn"
                onClick={() => handleShareSubmit(samePawnHere.i, pawn.cityId)}
                disabled={
                  !pawn.hand.some((c) => c.kind === "city" && c.cityId === pawn.cityId)
                  && !samePawnHere.p.hand.some((c) => c.kind === "city" && c.cityId === pawn.cityId)
                }
                title={`Pass the ${CITIES[pawn.cityId]!.name} card between roles here`}
              >
                Swap {CITIES[pawn.cityId]!.name} card
              </button>
              <button
                className="pf-btn"
                onClick={() => sendDispatch({ type: "setPending", pending: null })}
                title="Cancel share"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {state.pendingAction?.kind === "directFlight" && (
          <div className="pf-pending">
            <div className="pf-pending-title">Click a city you hold the card for to fly directly.</div>
            <button
              className="pf-btn"
              onClick={() => sendDispatch({ type: "setPending", pending: null })}
              title="Cancel direct flight"
            >Cancel</button>
          </div>
        )}

        {state.pendingAction?.kind === "charterFlight" && (
          <div className="pf-pending">
            <div className="pf-pending-title">Click any city to charter (discards your current city card).</div>
            <button
              className="pf-btn"
              onClick={() => sendDispatch({ type: "setPending", pending: null })}
              title="Cancel charter flight"
            >Cancel</button>
          </div>
        )}

        {state.pendingAction?.kind === "dispatcherMove" && (
          <div className="pf-pending">
            <div className="pf-pending-title">Click an adjacent city to move {ROLE_INFO[state.pawns[state.pendingAction.pawnIdx]!.role].label}.</div>
            <button
              className="pf-btn"
              onClick={() => sendDispatch({ type: "setPending", pending: null })}
              title="Cancel dispatcher move"
            >Cancel</button>
          </div>
        )}
      </div>

      {(state.phase === "won" || state.phase === "lost") && (
        <div className={`pf-end bounce-in ${state.phase === "won" ? "win" : "loss"}`}>
          <div className="pf-end-title">{state.phase === "won" ? "Cures complete!" : "Game over"}</div>
          <div className="pf-end-msg">{state.lastEvent}</div>
        </div>
      )}
    </div>
  );
}

export default PandemicFull;
