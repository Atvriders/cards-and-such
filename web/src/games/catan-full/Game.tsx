import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CatanState, CatanAction, CatanSettings, Resource } from "./state.js";
import {
  isTerminal,
  score,
  COST_SETTLEMENT,
  COST_CITY,
  COST_ROAD,
  COST_DEV,
  distanceRuleOk,
  roadConnects,
  vpFor,
  publicVpFor,
  longestRoadLengthFor,
  hexCenter,
  pipsFor,
  RESOURCE_LIST,
} from "./state.js";
import "./Game.css";

const HEX_R = 44; // pixel radius for hex (center → corner)
const MAP_W = 540;
const MAP_H = 540;
const VIEW_CX = MAP_W / 2;
const VIEW_CY = MAP_H / 2;

const RESOURCE_COLORS: Record<string, string> = {
  wood: "#2f6b32",
  brick: "#a8442a",
  sheep: "#a8d28a",
  wheat: "#e3c248",
  ore: "#7a8090",
  desert: "#d8c08a",
};
const RESOURCE_GLYPH: Record<string, string> = {
  wood: "TREE", brick: "BRK", sheep: "SHP", wheat: "WHT", ore: "ORE", desert: "DSRT",
};

function hexPolygonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function CatanFullGame({ state, dispatch, onGameOver }: GameProps<CatanState, CatanSettings>): JSX.Element {
  const t = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [t, onGameOver]);

  // Auto-tick CPU phase.
  useEffect(() => {
    if (state.phase === "cpu") {
      const id = setTimeout(() => dispatch({ type: "cpu_step" } as CatanAction), 600);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, state.players, state.rolledThisTurn, state.setupSubPhase, state.setupStep, dispatch]);

  // Computed pixel positions for hexes / vertices / edges.
  const hexPixels = useMemo(() => {
    return state.topology.hexes.map(h => {
      const c = hexCenter(h.q, h.r, HEX_R);
      return { cx: c.x + VIEW_CX, cy: c.y + VIEW_CY };
    });
  }, [state.topology]);

  const vertexPixels = useMemo(() => {
    return state.topology.vertices.map(v => ({
      x: v.x * HEX_R + VIEW_CX,
      y: v.y * HEX_R + VIEW_CY,
    }));
  }, [state.topology]);

  const edgePixels = useMemo(() => {
    return state.topology.edges.map(e => ({
      x1: e.x1 * HEX_R + VIEW_CX,
      y1: e.y1 * HEX_R + VIEW_CY,
      x2: e.x2 * HEX_R + VIEW_CX,
      y2: e.y2 * HEX_R + VIEW_CY,
    }));
  }, [state.topology]);

  // Selected vertex (UI) for "build city" or hover info.
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  useEffect(() => {
    // Reset selection when phase changes.
    setSelectedVertex(null);
  }, [state.phase, state.setupSubPhase]);

  // Bank-trade UI state.
  const [tradeGive, setTradeGive] = useState<Resource>("wood");
  const [tradeRecv, setTradeRecv] = useState<Resource>("brick");

  // Best-vertex / best-edge ids for the hint selector.
  const bestVertex = useMemo(() => {
    if (state.phase !== "setup" || state.current !== 0 || state.setupSubPhase !== "place_settlement") return null;
    let best = -1, bestScore = -Infinity;
    for (let vi = 0; vi < state.topology.vertices.length; vi++) {
      if (!distanceRuleOk(state, vi)) continue;
      const v = state.topology.vertices[vi]!;
      let sc = 0;
      for (const hi of v.adjHexes) sc += pipsFor(state.topology.hexes[hi]!.token);
      if (sc > bestScore) { bestScore = sc; best = vi; }
    }
    return best >= 0 ? best : null;
  }, [state]);

  const bestEdge = useMemo(() => {
    if (state.phase !== "setup" || state.current !== 0 || state.setupSubPhase !== "place_road") return null;
    if (state.setupPendingSettlement === null) return null;
    for (let ei = 0; ei < state.topology.edges.length; ei++) {
      const e = state.topology.edges[ei]!;
      if (e.a !== state.setupPendingSettlement && e.b !== state.setupPendingSettlement) continue;
      // Check unoccupied.
      let occ = false;
      for (const p of state.players) if (p.roads.includes(ei)) { occ = true; break; }
      if (occ) continue;
      return ei;
    }
    return null;
  }, [state]);

  // Vertex click handler.
  const onVertexClick = (vi: number): void => {
    if (state.phase === "setup" && state.current === 0 && state.setupSubPhase === "place_settlement") {
      dispatch({ type: "setup_place_settlement", vertex: vi } as CatanAction);
      return;
    }
    if (state.phase === "play" && state.current === 0) {
      // If owned settlement of human → upgrade option.
      if (state.players[0].settlements.includes(vi)) {
        setSelectedVertex(vi);
        return;
      }
      // Otherwise try building a settlement here.
      dispatch({ type: "build_settlement", vertex: vi } as CatanAction);
    }
  };

  const onEdgeClick = (ei: number): void => {
    if (state.phase === "setup" && state.current === 0 && state.setupSubPhase === "place_road") {
      dispatch({ type: "setup_place_road", edge: ei } as CatanAction);
      return;
    }
    if (state.phase === "play" && state.current === 0) {
      dispatch({ type: "build_road", edge: ei } as CatanAction);
    }
  };

  // Helpers for owner display.
  const ownerOfVertex = (vi: number): { who: 0 | 1 | null; kind: "settlement" | "city" | null } => {
    for (const p of state.players) {
      if (p.settlements.includes(vi)) return { who: p.id, kind: "settlement" };
      if (p.cities.includes(vi)) return { who: p.id, kind: "city" };
    }
    return { who: null, kind: null };
  };
  const ownerOfEdge = (ei: number): 0 | 1 | null => {
    for (const p of state.players) {
      if (p.roads.includes(ei)) return p.id;
    }
    return null;
  };

  const human = state.players[0];
  const cpu = state.players[1];

  const phaseLabel = (() => {
    if (state.phase === "setup") return state.current === 0 ? "Setup: Your Placement" : "Setup: CPU Placement";
    if (state.phase === "roll") return "Roll";
    if (state.phase === "play") return "Build / Trade";
    if (state.phase === "cpu") return "CPU Turn";
    if (state.phase === "done") return "Game Over";
    return state.phase;
  })();

  const humanVp = publicVpFor(state, 0) + human.vpHidden;
  const cpuVp = publicVpFor(state, 1);

  const canBuildSettlement = state.phase === "play" && state.current === 0 &&
    human.resources.wood >= 1 && human.resources.brick >= 1 &&
    human.resources.sheep >= 1 && human.resources.wheat >= 1;
  const canBuildCity = state.phase === "play" && state.current === 0 &&
    human.resources.wheat >= 2 && human.resources.ore >= 3;
  const canBuildRoad = state.phase === "play" && state.current === 0 &&
    human.resources.wood >= 1 && human.resources.brick >= 1;
  const canBuyDev = state.phase === "play" && state.current === 0 &&
    human.resources.sheep >= 1 && human.resources.wheat >= 1 && human.resources.ore >= 1 &&
    state.devDeck.length > 0;
  const canTrade = state.phase === "play" && state.current === 0 &&
    human.resources[tradeGive] >= 4 && tradeGive !== tradeRecv;
  const canPlayKnight = state.phase === "play" && state.current === 0 &&
    human.devCards.includes("knight");

  return (
    <div className="catan-wrap fade-in">
      <div className="catan-hud">
        <div className="catan-phase-pill" data-phase={state.phase}>
          <span className="catan-phase-label">{phaseLabel}</span>
        </div>
        <div className="catan-vps">
          <div className="catan-vp-side catan-vp-human pulse">
            <span className="catan-vp-name">YOU</span>
            <span className="catan-vp-num">{humanVp} VP</span>
            {state.longestRoad === 0 && <span className="catan-tag">Longest Road</span>}
            {state.largestArmy === 0 && <span className="catan-tag">Largest Army</span>}
          </div>
          <div className="catan-vp-side catan-vp-cpu">
            <span className="catan-vp-name">CPU</span>
            <span className="catan-vp-num">{cpuVp} VP</span>
            {state.longestRoad === 1 && <span className="catan-tag">Longest Road</span>}
            {state.largestArmy === 1 && <span className="catan-tag">Largest Army</span>}
          </div>
        </div>
      </div>

      <div className="catan-message">{state.message}</div>

      <div className="catan-board-wrap">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="catan-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="catan-sea-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1d4f78" />
              <stop offset="100%" stopColor="#0d2741" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#catan-sea-grad)" />

          {/* Hexes */}
          {state.topology.hexes.map((h, hi) => {
            const { cx, cy } = hexPixels[hi]!;
            const robbed = state.robberHex === hi;
            return (
              <g key={`h-${hi}`} className={`catan-hex catan-hex-${h.type}${robbed ? " catan-hex-robbed" : ""}`}>
                <polygon points={hexPolygonPoints(cx, cy, HEX_R)} fill={RESOURCE_COLORS[h.type]!}
                  stroke="#1a1a1a" strokeWidth="1.5" />
                <text x={cx} y={cy - 6} className="catan-hex-name" textAnchor="middle">{RESOURCE_GLYPH[h.type]}</text>
                {h.token !== null && (
                  <>
                    <circle cx={cx} cy={cy + 10} r={12} className="catan-hex-token-bg" />
                    <text x={cx} y={cy + 14} className={`catan-hex-token${h.token === 6 || h.token === 8 ? " catan-hex-token-hot" : ""}`}
                      textAnchor="middle">{h.token}</text>
                  </>
                )}
                {robbed && (
                  <text x={cx} y={cy - 24} className="catan-robber" textAnchor="middle">R</text>
                )}
              </g>
            );
          })}

          {/* Edges (roads) */}
          {edgePixels.map((e, ei) => {
            const owner = ownerOfEdge(ei);
            const isBest = bestEdge === ei;
            const clickable =
              (state.phase === "setup" && state.current === 0 && state.setupSubPhase === "place_road" &&
                state.setupPendingSettlement !== null &&
                (state.topology.edges[ei]!.a === state.setupPendingSettlement ||
                 state.topology.edges[ei]!.b === state.setupPendingSettlement) &&
                owner === null) ||
              (state.phase === "play" && state.current === 0 && canBuildRoad &&
                owner === null && roadConnects(state, 0, ei));
            return (
              <line key={`e-${ei}`}
                data-testid={isBest ? "catan-edge-best" : `catan-edge-${ei}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                className={`catan-edge${owner !== null ? ` catan-edge-owner-${owner}` : ""}${clickable ? " catan-edge-clickable" : ""}${isBest ? " catan-edge-best" : ""}`}
                onClick={() => clickable && onEdgeClick(ei)}
                strokeLinecap="round" />
            );
          })}

          {/* Vertices */}
          {vertexPixels.map((v, vi) => {
            const o = ownerOfVertex(vi);
            const isBest = bestVertex === vi;
            const isSelected = selectedVertex === vi;
            const ownerCls = o.who !== null ? ` catan-vertex-owner-${o.who} catan-vertex-${o.kind}` : "";
            const setupClickable = state.phase === "setup" && state.current === 0 &&
              state.setupSubPhase === "place_settlement" && distanceRuleOk(state, vi);
            const playClickable = state.phase === "play" && state.current === 0 && (
              (canBuildSettlement && o.who === null && distanceRuleOk(state, vi)) ||
              (canBuildCity && o.who === 0 && o.kind === "settlement")
            );
            const clickable = setupClickable || playClickable;
            return (
              <circle key={`v-${vi}`}
                data-testid={isBest ? "catan-vertex-best" : `catan-vertex-${vi}`}
                cx={v.x} cy={v.y}
                r={o.kind === "city" ? 9 : (o.who !== null ? 7 : 5)}
                className={`catan-vertex${ownerCls}${clickable ? " catan-vertex-clickable" : ""}${isSelected ? " catan-vertex-selected" : ""}${isBest ? " catan-vertex-best" : ""}`}
                onClick={() => clickable && onVertexClick(vi)} />
            );
          })}
        </svg>
      </div>

      {/* Dice display */}
      {state.lastRoll && (
        <div className="catan-dice">
          <div className="catan-die" aria-label={`die ${state.lastRoll.d1}`}>{state.lastRoll.d1}</div>
          <div className="catan-die" aria-label={`die ${state.lastRoll.d2}`}>{state.lastRoll.d2}</div>
          <span className="catan-dice-sum">= {state.lastRoll.sum}</span>
        </div>
      )}

      {/* Resources panel */}
      <div className="catan-resources" aria-label="Your resources">
        <div className="catan-res-title">Your hand</div>
        <div className="catan-res-list">
          {RESOURCE_LIST.map(k => (
            <div key={k} className={`catan-res catan-res-${k}`}>
              <span className="catan-res-label">{k.toUpperCase()}</span>
              <span className="catan-res-count">{human.resources[k]}</span>
            </div>
          ))}
        </div>
        <div className="catan-extras">
          <span title="Knights you have played">Knights: {human.knightsPlayed}</span>
          <span title="Unplayed knight cards in your hand">Knight cards: {human.devCards.filter(d => d === "knight").length}</span>
          <span title="Hidden Victory Point cards in your hand">VP cards: {human.vpHidden}</span>
          <span title="Longest road length">Road len: {longestRoadLengthFor(state, 0)}</span>
        </div>
      </div>

      <div className="catan-actions">
        {state.phase === "roll" && state.current === 0 && (
          <button data-testid="catan-roll" className="catan-btn catan-btn-primary"
            onClick={() => dispatch({ type: "roll" } as CatanAction)}
            title="Roll 2 dice to produce resources">
            Roll Dice
          </button>
        )}
        {state.phase === "play" && state.current === 0 && (
          <>
            <div className="catan-build-hints">
              <span className={`catan-build-hint${canBuildSettlement ? " ok" : ""}`} title={formatCost(COST_SETTLEMENT)}>Settlement</span>
              <span className={`catan-build-hint${canBuildCity ? " ok" : ""}`} title={formatCost(COST_CITY)}>City</span>
              <span className={`catan-build-hint${canBuildRoad ? " ok" : ""}`} title={formatCost(COST_ROAD)}>Road</span>
            </div>
            {canBuildCity && selectedVertex !== null && human.settlements.includes(selectedVertex) && (
              <button className="catan-btn catan-btn-primary"
                onClick={() => {
                  dispatch({ type: "build_city", vertex: selectedVertex } as CatanAction);
                  setSelectedVertex(null);
                }}
                title="Upgrade selected settlement to city (2 wheat + 3 ore)">
                Upgrade to City
              </button>
            )}
            <button data-testid="catan-buy-dev" className="catan-btn"
              disabled={!canBuyDev}
              onClick={() => dispatch({ type: "buy_dev" } as CatanAction)}
              title={`Buy development card: ${formatCost(COST_DEV)}`}>
              Buy Dev Card
            </button>
            <button data-testid="catan-knight" className="catan-btn"
              disabled={!canPlayKnight}
              onClick={() => dispatch({ type: "play_knight" } as CatanAction)}
              title="Play a Knight card to move the Robber">
              Play Knight
            </button>
            <div className="catan-trade-bar">
              <label className="catan-trade-label">Bank Trade (4:1)</label>
              <select className="catan-trade-sel" value={tradeGive}
                onChange={(e) => setTradeGive(e.target.value as Resource)}
                aria-label="Resource to give">
                {RESOURCE_LIST.map(k => <option key={`g-${k}`} value={k}>4 {k}</option>)}
              </select>
              <span className="catan-trade-arrow" aria-hidden="true">{"→"}</span>
              <select className="catan-trade-sel" value={tradeRecv}
                onChange={(e) => setTradeRecv(e.target.value as Resource)}
                aria-label="Resource to receive">
                {RESOURCE_LIST.map(k => <option key={`r-${k}`} value={k}>1 {k}</option>)}
              </select>
              <button data-testid="catan-trade" className="catan-btn"
                disabled={!canTrade}
                onClick={() => dispatch({ type: "trade_bank", give: tradeGive, receive: tradeRecv } as CatanAction)}
                title={`Trade 4 ${tradeGive} for 1 ${tradeRecv}`}>
                Trade
              </button>
            </div>
            <button data-testid="catan-end-turn" className="catan-btn catan-btn-ghost"
              onClick={() => dispatch({ type: "end_turn" } as CatanAction)}
              title="End your turn">
              End Turn
            </button>
          </>
        )}
        {state.phase === "cpu" && (
          <div className="catan-cpu-thinking" data-testid="catan-cpu-tick">CPU thinking...</div>
        )}
        {state.phase === "done" && (
          <div className="catan-done bounce-in">
            <div className="catan-done-msg">{state.message}</div>
            <div className="catan-done-stats">
              You: {vpFor(state, 0)} VP &middot; CPU: {vpFor(state, 1)} VP
            </div>
            <div className="catan-done-score">Score: {score(state)}</div>
          </div>
        )}
      </div>

      <div className="catan-log" aria-label="Event log">
        <div className="catan-log-title">Log</div>
        <ul>
          {state.log.map((entry, i) => (
            <li key={i} className={i === 0 ? "catan-log-newest" : ""}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formatCost(cost: Partial<{ wood: number; brick: number; sheep: number; wheat: number; ore: number }>): string {
  const parts: string[] = [];
  for (const k of ["wood", "brick", "sheep", "wheat", "ore"] as const) {
    const v = cost[k] ?? 0;
    if (v > 0) parts.push(`${v} ${k}`);
  }
  return parts.join(" + ");
}
