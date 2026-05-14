import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  PowerGridFullState,
  PowerGridFullAction,
  PowerGridFullSettings,
  ResourceKind,
} from "./state.js";
import {
  isTerminal,
  CITIES,
  REGION_COLORS,
  RESOURCE_KINDS,
  CURRENT_ROW,
  priceForResource,
  buildableCities,
  buildCostFor,
  citiesCanPower,
} from "./state.js";
import "./Game.css";

const MAP_W = 820;
const MAP_H = 500;

const RESOURCE_GLYPH: Record<ResourceKind, string> = {
  coal: "C", oil: "O", garbage: "G", uranium: "U",
};
const RESOURCE_LABEL: Record<ResourceKind, string> = {
  coal: "Coal", oil: "Oil", garbage: "Garbage", uranium: "Uranium",
};
const PLAYER_COLORS = ["#f4d35e", "#ee6c4d", "#98c1d9", "#9d4edd"];

export function PowerGridFullGame(
  { state, dispatch, onGameOver }: GameProps<PowerGridFullState, PowerGridFullSettings>
): JSX.Element {
  const t = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [t, onGameOver]);

  // Auto-advance order phase (purely computational).
  useEffect(() => {
    if (state.phase === "order") {
      const id = setTimeout(() => dispatch({ type: "cpu_step" } as PowerGridFullAction), 350);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, state.turn, dispatch]);

  // Auto-tick when an active CPU is up.
  const reversedOrder = useMemo(() => state.order.slice().reverse(), [state.order]);
  const activePid = state.phase === "bureaucracy"
    ? state.order[state.active]
    : reversedOrder[state.active];
  const activeIsCPU = activePid !== undefined && state.players[activePid]?.isCPU;
  useEffect(() => {
    if (activeIsCPU && (state.phase === "auction" || state.phase === "resources" ||
        state.phase === "build" || state.phase === "bureaucracy")) {
      const id = setTimeout(() => dispatch({ type: "cpu_step" } as PowerGridFullAction), 500);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [activeIsCPU, state.phase, state.active, dispatch]);

  const human = state.players[0]!;
  const humanIsActive = activePid === 0;

  const [resourceKind, setResourceKind] = useState<ResourceKind>("coal");
  const [resourceQty, setResourceQty] = useState<number>(1);

  const activeRegions = useMemo(() => new Set(state.activeRegions), [state.activeRegions]);

  // Map a city name → owner player id (or -1 if none).
  const cityOwners = useMemo(() => {
    const map = new Map<string, number[]>();
    for (let i = 0; i < state.players.length; i++) {
      for (const c of state.players[i]!.cities) {
        if (!map.has(c)) map.set(c, []);
        map.get(c)!.push(i);
      }
    }
    return map;
  }, [state.players]);

  const buildOpts = useMemo(
    () => humanIsActive && state.phase === "build" ? buildableCities(state, 0) : [],
    [state, humanIsActive]
  );
  const buildOptionMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of buildOpts) m.set(c.name, buildCostFor(state, 0, c));
    return m;
  }, [state, buildOpts]);

  const phaseLabel = (() => {
    switch (state.phase) {
      case "order":       return "Phase 1 — Order";
      case "auction":     return "Phase 2 — Auction";
      case "resources":   return "Phase 3 — Resources";
      case "build":       return "Phase 4 — Build";
      case "bureaucracy": return "Phase 5 — Bureaucracy";
      case "done":        return "Game Over";
    }
  })();

  // Pricing for a buy of `resourceQty` of `resourceKind`.
  const resourceQuote = useMemo(() => {
    let total = 0;
    let stock = state.supply[resourceKind];
    if (resourceQty > stock) return { total: 0, ok: false };
    for (let i = 0; i < resourceQty; i++) {
      total += priceForResource(resourceKind, stock);
      stock--;
    }
    return { total, ok: total <= human.elektro };
  }, [resourceKind, resourceQty, state.supply, human.elektro]);

  const canCurrentRowAfford = (idx: number): boolean => {
    if (idx < 0 || idx >= Math.min(CURRENT_ROW, state.market.length)) return false;
    const pl = state.market[idx]!;
    return human.elektro >= pl.id;
  };

  const cheapestAffordableMarketIdx = useMemo(() => {
    if (state.phase !== "auction" || !humanIsActive) return -1;
    for (let i = 0; i < Math.min(CURRENT_ROW, state.market.length); i++) {
      if (canCurrentRowAfford(i)) return i;
    }
    return -1;
  }, [state, humanIsActive]);

  const cheapestBuildCity = useMemo(() => {
    if (state.phase !== "build" || !humanIsActive) return null;
    let best: { name: string; cost: number } | null = null;
    for (const [name, cost] of buildOptionMap.entries()) {
      if (cost > human.elektro) continue;
      if (!best || cost < best.cost) best = { name, cost };
    }
    return best;
  }, [state, humanIsActive, buildOptionMap, human.elektro]);

  return (
    <div className="pgf-wrap fade-in">
      <div className="pgf-hud">
        <div className="pgf-phase-pill">{phaseLabel} <span className="pgf-turn">· Turn {state.turn}</span></div>
        <div className="pgf-message">{state.message}</div>
      </div>

      <div className="pgf-players">
        {state.players.map((p, i) => (
          <div key={i} className={`pgf-player ${activePid === p.id ? "pgf-player-active" : ""}`}>
            <span className="pgf-pdot" style={{ background: PLAYER_COLORS[i] }} aria-hidden />
            <span className="pgf-pname">{i === 0 ? "YOU" : `CPU${i}`}</span>
            <span className="pgf-pcash" title="Elektro (cash)">${p.elektro}</span>
            <span className="pgf-pcities" title="Cities connected">{p.cities.length}c</span>
            <span className="pgf-pplants" title="Plants owned">{p.plants.length}pl</span>
          </div>
        ))}
      </div>

      <div className="pgf-board-wrap">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="pgf-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="pgf-bg" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#1e2a3a" />
              <stop offset="100%" stopColor="#0c151f" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#pgf-bg)" />

          {/* Region back-tints */}
          {CITIES.filter(c => activeRegions.has(c.region)).map(c => (
            <circle key={`bg-${c.name}`} cx={c.x} cy={c.y} r={25}
              fill={REGION_COLORS[c.region]} opacity={0.10} />
          ))}

          {/* Cities */}
          {CITIES.map(c => {
            const active = activeRegions.has(c.region);
            const owners = cityOwners.get(c.name) ?? [];
            const isBuildOpt = buildOptionMap.has(c.name);
            const isCheapest = cheapestBuildCity?.name === c.name;
            const cost = buildOptionMap.get(c.name);
            const cls = [
              "pgf-city",
              active ? "" : "pgf-city-inactive",
              isBuildOpt ? "pgf-city-buildable" : "",
              isCheapest ? "pgf-city-cheapest" : "",
            ].filter(Boolean).join(" ");
            return (
              <g key={c.name} className={cls}
                onClick={() => {
                  if (state.phase === "build" && humanIsActive && isBuildOpt && (cost ?? Infinity) <= human.elektro) {
                    dispatch({ type: "build_city", cityName: c.name } as PowerGridFullAction);
                  }
                }}
                data-testid={isCheapest ? "pgf-build-primary" : `pgf-city-${c.name.replace(/\s+/g, "-")}`}
              >
                <circle cx={c.x} cy={c.y} r={11}
                  fill={active ? REGION_COLORS[c.region] : "#444"}
                  stroke={active ? "#fff" : "#666"} strokeWidth={1.5} opacity={active ? 1 : 0.4} />
                {owners.map((oid, i) => (
                  <circle key={oid} cx={c.x + (i - (owners.length - 1) / 2) * 6} cy={c.y - 18}
                    r={3.6} fill={PLAYER_COLORS[oid]} stroke="#000" strokeWidth={0.5} />
                ))}
                <text x={c.x} y={c.y + 26} className="pgf-city-name" textAnchor="middle">{c.name}</text>
                {cost !== undefined && (
                  <text x={c.x} y={c.y + 3} className="pgf-city-cost" textAnchor="middle">${cost}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pgf-panels">
        {/* Plant market */}
        <div className="pgf-panel pgf-panel-market">
          <div className="pgf-panel-title">Plant Market</div>
          <div className="pgf-plants">
            {state.market.map((pl, i) => {
              const inCurrent = i < CURRENT_ROW;
              const cheapest = cheapestAffordableMarketIdx === i;
              return (
                <button key={pl.id}
                  className={`pgf-plant ${inCurrent ? "pgf-plant-current" : "pgf-plant-future"} ${cheapest ? "pgf-plant-cheapest" : ""}`}
                  data-testid={cheapest ? "pgf-auction-primary" : `pgf-plant-${pl.id}`}
                  disabled={!(state.phase === "auction" && humanIsActive && inCurrent && canCurrentRowAfford(i))}
                  onClick={() => dispatch({ type: "auction_buy", marketIdx: i } as PowerGridFullAction)}
                  title={`Plant ${pl.id} — fuel: ${pl.fuel}, cost: ${pl.cost}, powers ${pl.cities} cities. Min bid $${pl.id}.`}
                >
                  <span className="pgf-plant-id">#{pl.id}</span>
                  <span className="pgf-plant-fuel">{pl.fuel}</span>
                  <span className="pgf-plant-out">{pl.cost}→{pl.cities}c</span>
                </button>
              );
            })}
          </div>
          {state.phase === "auction" && humanIsActive && (
            <button className="pgf-btn pgf-btn-ghost"
              onClick={() => dispatch({ type: "auction_pass" } as PowerGridFullAction)}
              title="Skip auction this round">
              Pass on auction
            </button>
          )}
        </div>

        {/* Resources */}
        <div className="pgf-panel pgf-panel-resources">
          <div className="pgf-panel-title">Resource Market</div>
          <div className="pgf-resources">
            {RESOURCE_KINDS.map(k => (
              <div key={k} className={`pgf-res pgf-res-${k}`}>
                <span className="pgf-res-glyph">{RESOURCE_GLYPH[k]}</span>
                <span className="pgf-res-label">{RESOURCE_LABEL[k]}</span>
                <span className="pgf-res-stock" title="Units in market">{state.supply[k]}</span>
                <span className="pgf-res-price" title="Next-unit price">${priceForResource(k, state.supply[k])}</span>
              </div>
            ))}
          </div>
          {state.phase === "resources" && humanIsActive && (
            <div className="pgf-resource-controls">
              <label className="pgf-ctrl">
                Kind:
                <select value={resourceKind}
                  onChange={(e) => setResourceKind(e.target.value as ResourceKind)}
                  title="Pick a resource to buy">
                  {RESOURCE_KINDS.map(k => <option key={k} value={k}>{RESOURCE_LABEL[k]}</option>)}
                </select>
              </label>
              <label className="pgf-ctrl">
                Qty:
                <input type="number" min={1} max={6} value={resourceQty}
                  onChange={(e) => setResourceQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  title="How many to buy" />
              </label>
              <span className="pgf-quote" title="Total cost for this purchase">
                Total: ${resourceQuote.total} {resourceQuote.ok ? "" : " (cannot afford)"}
              </span>
              <button className="pgf-btn pgf-btn-primary"
                data-testid="pgf-resource-primary"
                disabled={!resourceQuote.ok || resourceQuote.total === 0}
                onClick={() => dispatch({ type: "buy_resource", kind: resourceKind, qty: resourceQty } as PowerGridFullAction)}
                title="Buy this resource bundle">
                Buy {resourceQty} {RESOURCE_LABEL[resourceKind]}
              </button>
              <button className="pgf-btn pgf-btn-ghost"
                onClick={() => dispatch({ type: "resource_done" } as PowerGridFullAction)}
                title="Finish resource buying for this round">
                Done buying
              </button>
            </div>
          )}
        </div>

        {/* Your assets */}
        <div className="pgf-panel pgf-panel-self">
          <div className="pgf-panel-title">Your Holdings</div>
          <div className="pgf-self-row">
            <span title="Your cash" className="pulse">${human.elektro}</span>
            <span title="Cities you have powered last bureaucracy">Can power: {citiesCanPower(human)} / {human.cities.length}</span>
          </div>
          <div className="pgf-self-row">
            {RESOURCE_KINDS.map(k => (
              <span key={k} className={`pgf-self-res pgf-self-res-${k}`} title={`${RESOURCE_LABEL[k]} on hand`}>
                {RESOURCE_GLYPH[k]}:{human.resources[k]}
              </span>
            ))}
          </div>
          <div className="pgf-self-plants">
            {human.plants.length === 0 && <span className="pgf-empty">No plants yet — bid in the auction!</span>}
            {human.plants.map(pl => (
              <div key={pl.id} className="pgf-self-plant" title={`Plant ${pl.id}: ${pl.fuel} ${pl.cost}→${pl.cities}c`}>
                #{pl.id} {pl.fuel} <small>{pl.cost}→{pl.cities}</small>
              </div>
            ))}
          </div>
          {state.phase === "build" && humanIsActive && (
            <button className="pgf-btn pgf-btn-ghost"
              data-testid="pgf-build-primary-done"
              onClick={() => dispatch({ type: "build_done" } as PowerGridFullAction)}
              title="Finish building for this round">
              Done building
            </button>
          )}
          {state.phase === "bureaucracy" && humanIsActive && (
            <button className="pgf-btn pgf-btn-primary"
              data-testid="pgf-power-primary"
              onClick={() => dispatch({ type: "power", plantIds: human.plants.map(p => p.id) } as PowerGridFullAction)}
              title="Power as many cities as possible (auto-assigns fuel)">
              Power {citiesCanPower(human)} cities
            </button>
          )}
        </div>
      </div>

      {/* Hidden hint targets for early phases */}
      {state.phase === "order" && (
        <span data-testid="pgf-order-tick" style={{ position: "absolute", opacity: 0 }} aria-hidden>order</span>
      )}

      {t && (
        <div className="pgf-done bounce-in" role="alert">
          <div className="pgf-done-title">
            {state.winner === 0 ? "Victory!" : `Player ${(state.winner ?? 0) + 1} wins.`}
          </div>
          <div className="pgf-done-body">
            {state.players.map((p, i) => (
              <div key={i}>
                {i === 0 ? "You" : `CPU${i}`}: {citiesCanPower(p)} powered / {p.cities.length} cities · ${p.elektro}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pgf-log" aria-label="Game log">
        {state.log.slice(0, 6).map((line, i) => <div key={i} className="pgf-log-line">{line}</div>)}
      </div>
    </div>
  );
}
