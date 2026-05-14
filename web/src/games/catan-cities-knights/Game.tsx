import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CKState, CKAction, CKSettings, Resource, ProgressCardColor } from "./state.js";
import {
  isTerminal,
  score,
  COST_SETTLEMENT,
  COST_CITY,
  COST_ROAD,
  COST_WALL,
  COST_KNIGHT,
  COST_PROMOTE,
  COST_ACTIVATE,
  distanceRuleOk,
  roadConnects,
  vpFor,
  hexCenter,
  pipsFor,
  activeKnightStrength,
  totalKnightStrength,
  isVertexOccupied,
  RESOURCE_LIST,
  COMMODITY_LIST,
  BARBARIAN_TRACK_LEN,
  TILE_TO_COMMODITY,
} from "./state.js";
import "./Game.css";

const HEX_R = 40;
const MAP_W = 540;
const MAP_H = 540;
const VIEW_CX = MAP_W / 2;
const VIEW_CY = MAP_H / 2;

const PLAYER_COLORS: readonly string[] = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981"];
const PLAYER_NAMES: readonly string[] = ["YOU", "CPU-2", "CPU-3", "CPU-4"];

const RESOURCE_COLORS: Record<string, string> = {
  wood: "#2f6b32",
  brick: "#a8442a",
  sheep: "#a8d28a",
  wheat: "#e3c248",
  ore: "#7a8090",
  desert: "#d8c08a",
};
const TILE_GLYPH: Record<string, string> = {
  wood: "FRST", brick: "BRK", sheep: "PSTR", wheat: "WHT", ore: "MTN", desert: "DSRT",
};

function hexPolygonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function formatCost(cost: Partial<{ wood: number; brick: number; sheep: number; wheat: number; ore: number }>): string {
  const parts: string[] = [];
  for (const k of ["wood", "brick", "sheep", "wheat", "ore"] as const) {
    const v = cost[k] ?? 0;
    if (v > 0) parts.push(`${v} ${k}`);
  }
  return parts.join(" + ");
}

export function CatanCitiesKnightsGame({ state, dispatch, onGameOver }: GameProps<CKState, CKSettings>): JSX.Element {
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
      const id = setTimeout(() => dispatch({ type: "cpu_step" } as CKAction), 500);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, state.current, state.players, state.rolledThisTurn, state.setupSubPhase, state.setupStep, dispatch]);

  const hexPixels = useMemo(() => state.topology.hexes.map(h => {
    const c = hexCenter(h.q, h.r, HEX_R);
    return { cx: c.x + VIEW_CX, cy: c.y + VIEW_CY };
  }), [state.topology]);

  const vertexPixels = useMemo(() => state.topology.vertices.map(v => ({
    x: v.x * HEX_R + VIEW_CX,
    y: v.y * HEX_R + VIEW_CY,
  })), [state.topology]);

  const edgePixels = useMemo(() => state.topology.edges.map(e => ({
    x1: e.x1 * HEX_R + VIEW_CX,
    y1: e.y1 * HEX_R + VIEW_CY,
    x2: e.x2 * HEX_R + VIEW_CX,
    y2: e.y2 * HEX_R + VIEW_CY,
  })), [state.topology]);

  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  useEffect(() => { setSelectedVertex(null); }, [state.phase, state.setupSubPhase]);

  const [tradeGive, setTradeGive] = useState<Resource>("wood");
  const [tradeRecv, setTradeRecv] = useState<Resource>("brick");

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
      let occ = false;
      for (const p of state.players) if (p.roads.includes(ei)) { occ = true; break; }
      if (occ) continue;
      return ei;
    }
    return null;
  }, [state]);

  const human = state.players[0];

  const onVertexClick = (vi: number): void => {
    if (state.phase === "setup" && state.current === 0 && state.setupSubPhase === "place_settlement") {
      dispatch({ type: "setup_place_settlement", vertex: vi } as CKAction);
      return;
    }
    if (state.phase === "play" && state.current === 0) {
      // Owned settlement → mark for city upgrade. Owned city → mark for wall.
      if (human.settlements.includes(vi)) {
        setSelectedVertex(vi);
        return;
      }
      if (human.cities.includes(vi)) {
        setSelectedVertex(vi);
        return;
      }
      // Otherwise try building a settlement.
      dispatch({ type: "build_settlement", vertex: vi } as CKAction);
    }
  };

  const onEdgeClick = (ei: number): void => {
    if (state.phase === "setup" && state.current === 0 && state.setupSubPhase === "place_road") {
      dispatch({ type: "setup_place_road", edge: ei } as CKAction);
      return;
    }
    if (state.phase === "play" && state.current === 0) {
      dispatch({ type: "build_road", edge: ei } as CKAction);
    }
  };

  const ownerOfVertex = (vi: number): { who: number | null; kind: "settlement" | "city" | "knight" | null; level?: number; active?: boolean; walled?: boolean } => {
    for (const p of state.players) {
      if (p.cities.includes(vi)) return { who: p.id, kind: "city", walled: p.cityWalls.includes(vi) };
      if (p.settlements.includes(vi)) return { who: p.id, kind: "settlement" };
      const k = p.knights.find(kk => kk.vertex === vi);
      if (k) return { who: p.id, kind: "knight", level: k.level, active: k.active };
    }
    return { who: null, kind: null };
  };

  const ownerOfEdge = (ei: number): number | null => {
    for (const p of state.players) if (p.roads.includes(ei)) return p.id;
    return null;
  };

  const phaseLabel = (() => {
    if (state.phase === "setup") return state.current === 0 ? "Setup: Your Placement" : `Setup: CPU P${state.current + 1}`;
    if (state.phase === "roll") return "Roll";
    if (state.phase === "play") return "Build / Recruit / Trade";
    if (state.phase === "cpu") return `CPU P${state.current + 1} Turn`;
    if (state.phase === "done") return "Game Over";
    return state.phase;
  })();

  const canBuildSettlement = state.phase === "play" && state.current === 0 &&
    human.resources.wood >= 1 && human.resources.brick >= 1 &&
    human.resources.sheep >= 1 && human.resources.wheat >= 1;
  const canBuildCity = state.phase === "play" && state.current === 0 &&
    human.resources.wheat >= 2 && human.resources.ore >= 3;
  const canBuildRoad = state.phase === "play" && state.current === 0 &&
    human.resources.wood >= 1 && human.resources.brick >= 1;
  const canBuildWall = state.phase === "play" && state.current === 0 &&
    human.resources.brick >= 2;
  const canRecruitKnight = state.phase === "play" && state.current === 0 &&
    human.resources.sheep >= 1 && human.resources.ore >= 1;
  const canPromoteKnight = state.phase === "play" && state.current === 0 &&
    human.resources.sheep >= 1 && human.resources.ore >= 1 &&
    human.knights.some(k => k.level < 3);
  const canActivateKnight = state.phase === "play" && state.current === 0 &&
    human.resources.wheat >= 1 && human.knights.some(k => !k.active);
  const canTrade = state.phase === "play" && state.current === 0 &&
    human.resources[tradeGive] >= 4 && tradeGive !== tradeRecv;

  const findFirstInactiveKnight = (): number => human.knights.findIndex(k => !k.active);
  const findFirstPromotableKnight = (): number => human.knights.findIndex(k => k.level < 3);
  const findFirstKnightVertex = (): number => {
    // Use the player's reachable network for the next recruit.
    const reachable = new Set<number>();
    for (const ei of human.roads) {
      const e = state.topology.edges[ei]!;
      reachable.add(e.a); reachable.add(e.b);
    }
    for (const vi of reachable) {
      if (!isVertexOccupied(state, vi)) return vi;
    }
    return -1;
  };

  const canBuyScience = state.phase === "play" && state.current === 0 &&
    human.resources.wheat >= 1 && human.commodities.paper >= 1 && state.scienceDeck.length > 0;
  const canBuyPolitics = state.phase === "play" && state.current === 0 &&
    human.resources.wheat >= 1 && human.commodities.coin >= 1 && state.politicsDeck.length > 0;
  const canBuyTrade = state.phase === "play" && state.current === 0 &&
    human.resources.wheat >= 1 && human.commodities.cloth >= 1 && state.tradeDeck.length > 0;

  const buyProgressCard = (color: ProgressCardColor): void => {
    dispatch({ type: "buy_progress_card", color } as CKAction);
  };

  return (
    <div className="ck-wrap fade-in">
      <div className="ck-hud">
        <div className="ck-phase-pill" data-phase={state.phase}>
          <span className="ck-phase-label">{phaseLabel}</span>
        </div>
        <div className="ck-vps">
          {state.players.map(p => (
            <div key={p.id} className={`ck-vp-side${p.id === 0 ? " ck-vp-human pulse" : ""}`}
                 style={{ borderColor: PLAYER_COLORS[p.id]! }}>
              <span className="ck-vp-name" style={{ color: PLAYER_COLORS[p.id]! }}>{PLAYER_NAMES[p.id]}</span>
              <span className="ck-vp-num">{vpFor(state, p.id)} VP</span>
              <span className="ck-vp-knights" title="Active / Total knight strength">
                K {activeKnightStrength(p)}/{totalKnightStrength(p)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="ck-message">{state.message}</div>

      <div className="ck-barbarian" aria-label="Barbarian ship track">
        <span className="ck-barb-label">Barbarians:</span>
        <div className="ck-barb-track">
          {Array.from({ length: BARBARIAN_TRACK_LEN }, (_, i) => (
            <span key={i} className={`ck-barb-dot${i < state.barbarianTrack ? " ck-barb-dot-filled" : ""}${i === BARBARIAN_TRACK_LEN - 1 ? " ck-barb-dot-end" : ""}`}>
              {i === BARBARIAN_TRACK_LEN - 1 ? "X" : ""}
            </span>
          ))}
        </div>
        <span className="ck-barb-count" title="Number of barbarian arrivals so far">Arrivals: {state.barbarianArrivals}</span>
      </div>

      <div className="ck-board-wrap">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="ck-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="ck-sea-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1d4f78" />
              <stop offset="100%" stopColor="#0d2741" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#ck-sea-grad)" />

          {state.topology.hexes.map((h, hi) => {
            const { cx, cy } = hexPixels[hi]!;
            const commodity = TILE_TO_COMMODITY[h.type];
            return (
              <g key={`h-${hi}`} className={`ck-hex ck-hex-${h.type}`}>
                <polygon points={hexPolygonPoints(cx, cy, HEX_R)} fill={RESOURCE_COLORS[h.type]!}
                  stroke="#1a1a1a" strokeWidth="1.5" />
                <text x={cx} y={cy - 4} className="ck-hex-name" textAnchor="middle">{TILE_GLYPH[h.type]}</text>
                {commodity && (
                  <text x={cx} y={cy - 18} className="ck-hex-commodity" textAnchor="middle">+{commodity}</text>
                )}
                {h.token !== null && (
                  <>
                    <circle cx={cx} cy={cy + 12} r={11} className="ck-hex-token-bg" />
                    <text x={cx} y={cy + 16} className={`ck-hex-token${h.token === 6 || h.token === 8 ? " ck-hex-token-hot" : ""}`}
                      textAnchor="middle">{h.token}</text>
                  </>
                )}
              </g>
            );
          })}

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
                data-testid={isBest ? "ck-edge-best" : `ck-edge-${ei}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke={owner !== null ? PLAYER_COLORS[owner]! : "#3a3a3a"}
                className={`ck-edge${owner !== null ? ` ck-edge-owner-${owner}` : ""}${clickable ? " ck-edge-clickable" : ""}${isBest ? " ck-edge-best" : ""}`}
                onClick={() => clickable && onEdgeClick(ei)}
                strokeLinecap="round" />
            );
          })}

          {vertexPixels.map((v, vi) => {
            const o = ownerOfVertex(vi);
            const isBest = bestVertex === vi;
            const isSelected = selectedVertex === vi;
            const setupClickable = state.phase === "setup" && state.current === 0 &&
              state.setupSubPhase === "place_settlement" && distanceRuleOk(state, vi);
            const playClickable = state.phase === "play" && state.current === 0 && (
              (canBuildSettlement && o.who === null && distanceRuleOk(state, vi)) ||
              (canBuildCity && o.who === 0 && o.kind === "settlement") ||
              (canBuildWall && o.who === 0 && o.kind === "city" && !o.walled)
            );
            const clickable = setupClickable || playClickable;
            const fill = o.who !== null ? PLAYER_COLORS[o.who]! : "#888";
            const r = o.kind === "city" ? 9 : o.kind === "knight" ? 7 : (o.who !== null ? 7 : 5);
            return (
              <g key={`v-${vi}`}>
                <circle
                  data-testid={isBest ? "ck-vertex-best" : `ck-vertex-${vi}`}
                  cx={v.x} cy={v.y} r={r}
                  fill={fill}
                  stroke={o.kind === "city" ? "#fff" : "#000"}
                  strokeWidth={o.walled ? 3 : 1.5}
                  className={`ck-vertex${o.who !== null ? ` ck-vertex-owner-${o.who}` : ""}${clickable ? " ck-vertex-clickable" : ""}${isSelected ? " ck-vertex-selected" : ""}${isBest ? " ck-vertex-best" : ""}`}
                  onClick={() => clickable && onVertexClick(vi)} />
                {o.kind === "knight" && (
                  <text x={v.x} y={v.y + 3} textAnchor="middle"
                    className={`ck-knight-mark${o.active ? " ck-knight-active" : ""}`}>
                    {o.level}
                  </text>
                )}
                {o.walled && (
                  <rect x={v.x - 11} y={v.y - 11} width={22} height={22} fill="none"
                    stroke="#fff" strokeDasharray="2 2" strokeWidth={1.5} />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {state.lastRoll && (
        <div className="ck-dice">
          <div className="ck-die" aria-label={`die ${state.lastRoll.d1}`}>{state.lastRoll.d1}</div>
          <div className="ck-die" aria-label={`die ${state.lastRoll.d2}`}>{state.lastRoll.d2}</div>
          <span className="ck-dice-sum">= {state.lastRoll.sum}</span>
        </div>
      )}

      {state.lastBarbarianOutcome && (
        <div className="ck-barb-outcome" role="status">{state.lastBarbarianOutcome}</div>
      )}

      <div className="ck-resources" aria-label="Your hand">
        <div className="ck-res-title">Your hand</div>
        <div className="ck-res-list">
          {RESOURCE_LIST.map(k => (
            <div key={k} className={`ck-res ck-res-${k}`}>
              <span className="ck-res-label">{k.toUpperCase()}</span>
              <span className="ck-res-count">{human.resources[k]}</span>
            </div>
          ))}
        </div>
        <div className="ck-com-list">
          {COMMODITY_LIST.map(k => (
            <div key={k} className={`ck-com ck-com-${k}`}>
              <span className="ck-com-label">{k.toUpperCase()}</span>
              <span className="ck-com-count">{human.commodities[k]}</span>
            </div>
          ))}
        </div>
        <div className="ck-extras">
          <span title="Active knight strength contributes to barbarian defense">
            Active knight strength: {activeKnightStrength(human)}
          </span>
          <span title="Progress cards held">
            Cards: {human.progressCards.length}
          </span>
          <span title="Bonus VP (defender + special VP cards)">
            Bonus VP: {human.bonusVp}
          </span>
        </div>
        {human.progressCards.length > 0 && (
          <div className="ck-cards-row">
            {human.progressCards.map((c, i) => (
              <button key={i} className={`ck-card ck-card-${c.color}`}
                onClick={() => dispatch({ type: "play_progress_card", index: i } as CKAction)}
                title={`Play ${c.name} (${c.color}): grants a small bonus`}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ck-actions">
        {state.phase === "roll" && state.current === 0 && (
          <button data-testid="ck-roll" className="ck-btn ck-btn-primary"
            onClick={() => dispatch({ type: "roll" } as CKAction)}
            title="Roll 2 dice to produce resources and commodities">
            Roll Dice
          </button>
        )}
        {state.phase === "play" && state.current === 0 && (
          <>
            <div className="ck-build-hints">
              <span className={`ck-build-hint${canBuildSettlement ? " ok" : ""}`} title={formatCost(COST_SETTLEMENT)}>Settlement</span>
              <span className={`ck-build-hint${canBuildCity ? " ok" : ""}`} title={formatCost(COST_CITY)}>City</span>
              <span className={`ck-build-hint${canBuildRoad ? " ok" : ""}`} title={formatCost(COST_ROAD)}>Road</span>
              <span className={`ck-build-hint${canBuildWall ? " ok" : ""}`} title={formatCost(COST_WALL)}>Wall</span>
              <span className={`ck-build-hint${canRecruitKnight ? " ok" : ""}`} title={formatCost(COST_KNIGHT)}>Knight</span>
            </div>
            {canBuildCity && selectedVertex !== null && human.settlements.includes(selectedVertex) && (
              <button className="ck-btn ck-btn-primary"
                onClick={() => {
                  dispatch({ type: "build_city", vertex: selectedVertex } as CKAction);
                  setSelectedVertex(null);
                }}
                title="Upgrade selected settlement to a city (2 wheat + 3 ore)">
                Upgrade to City
              </button>
            )}
            {canBuildWall && selectedVertex !== null && human.cities.includes(selectedVertex) && !human.cityWalls.includes(selectedVertex) && (
              <button className="ck-btn"
                onClick={() => {
                  dispatch({ type: "build_wall", vertex: selectedVertex } as CKAction);
                  setSelectedVertex(null);
                }}
                title="Build a city wall (2 brick) to absorb 1 barbarian sack">
                Build City Wall
              </button>
            )}
            <button data-testid="ck-recruit" className="ck-btn"
              disabled={!canRecruitKnight}
              onClick={() => {
                const v = findFirstKnightVertex();
                if (v >= 0) dispatch({ type: "recruit_knight", vertex: v } as CKAction);
              }}
              title={`Recruit basic knight (${formatCost(COST_KNIGHT)}) on a vertex adjacent to your road`}>
              Recruit Knight
            </button>
            <button data-testid="ck-promote" className="ck-btn"
              disabled={!canPromoteKnight}
              onClick={() => {
                const idx = findFirstPromotableKnight();
                if (idx >= 0) dispatch({ type: "promote_knight", index: idx } as CKAction);
              }}
              title={`Promote a knight (${formatCost(COST_PROMOTE)}) from basic→strong or strong→mighty`}>
              Promote Knight
            </button>
            <button data-testid="ck-activate" className="ck-btn"
              disabled={!canActivateKnight}
              onClick={() => {
                const idx = findFirstInactiveKnight();
                if (idx >= 0) dispatch({ type: "activate_knight", index: idx } as CKAction);
              }}
              title={`Activate an inactive knight (${formatCost(COST_ACTIVATE)}) so it can fight barbarians`}>
              Activate Knight
            </button>
            <div className="ck-progress-row">
              <button className="ck-btn ck-btn-science" disabled={!canBuyScience}
                onClick={() => buyProgressCard("science")}
                title="Buy Science progress card (1 wheat + 1 paper)">
                Buy Science
              </button>
              <button className="ck-btn ck-btn-politics" disabled={!canBuyPolitics}
                onClick={() => buyProgressCard("politics")}
                title="Buy Politics progress card (1 wheat + 1 coin)">
                Buy Politics
              </button>
              <button className="ck-btn ck-btn-trade" disabled={!canBuyTrade}
                onClick={() => buyProgressCard("trade")}
                title="Buy Trade progress card (1 wheat + 1 cloth)">
                Buy Trade
              </button>
            </div>
            <div className="ck-trade-bar">
              <label className="ck-trade-label">Bank Trade (4:1)</label>
              <select className="ck-trade-sel" value={tradeGive}
                onChange={(e) => setTradeGive(e.target.value as Resource)}
                aria-label="Resource to give">
                {RESOURCE_LIST.map(k => <option key={`g-${k}`} value={k}>4 {k}</option>)}
              </select>
              <span className="ck-trade-arrow" aria-hidden="true">{"→"}</span>
              <select className="ck-trade-sel" value={tradeRecv}
                onChange={(e) => setTradeRecv(e.target.value as Resource)}
                aria-label="Resource to receive">
                {RESOURCE_LIST.map(k => <option key={`r-${k}`} value={k}>1 {k}</option>)}
              </select>
              <button data-testid="ck-trade" className="ck-btn"
                disabled={!canTrade}
                onClick={() => dispatch({ type: "trade_bank", give: tradeGive, receive: tradeRecv } as CKAction)}
                title={`Trade 4 ${tradeGive} for 1 ${tradeRecv}`}>
                Trade
              </button>
            </div>
            <button data-testid="ck-end-turn" className="ck-btn ck-btn-ghost"
              onClick={() => dispatch({ type: "end_turn" } as CKAction)}
              title="End your turn">
              End Turn
            </button>
          </>
        )}
        {state.phase === "cpu" && (
          <div className="ck-cpu-thinking" data-testid="ck-cpu-tick">CPU P{state.current + 1} thinking...</div>
        )}
        {state.phase === "done" && (
          <div className="ck-done bounce-in">
            <div className="ck-done-msg">{state.message}</div>
            <div className="ck-done-stats">
              You: {vpFor(state, 0)} VP &middot; CPU2: {vpFor(state, 1)} &middot; CPU3: {vpFor(state, 2)} &middot; CPU4: {vpFor(state, 3)}
            </div>
            <div className="ck-done-score">Score: {score(state)}</div>
          </div>
        )}
      </div>

      <div className="ck-log" aria-label="Event log">
        <div className="ck-log-title">Log</div>
        <ul>
          {state.log.map((entry, i) => (
            <li key={i} className={i === 0 ? "ck-log-newest" : ""}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

