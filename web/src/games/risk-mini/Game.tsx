import { useEffect, useMemo, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RiskState, RiskActionAll, RiskSettings } from "./state.js";
import { isTerminal, score, TERRITORY_NAMES, TERRITORY_LAYOUT, ADJ, MAX_TURNS } from "./state.js";
import "./Game.css";

const MAP_W = 560;
const MAP_H = 360;
const TERR_R = 46;

function Die({ value, who }: { value: number; who: "att" | "def" }): JSX.Element {
  return (
    <div className={`riskmini-die riskmini-die-${who}`} aria-label={`${who === "att" ? "attacker" : "defender"} rolled ${value}`}>
      {value}
    </div>
  );
}

export function RiskMiniGame({ state, dispatch, onGameOver }: GameProps<RiskState, RiskSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const [fortifyAmt, setFortifyAmt] = useState(1);

  // Auto-run CPU phase
  useEffect(() => {
    if (state.phase === "cpu") {
      const id = setTimeout(() => dispatch({ type: "cpu" } as RiskActionAll), 700);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, dispatch]);

  const pTerritories = state.owner.filter(o => o === "p").length;
  const cTerritories = state.owner.filter(o => o === "c").length;
  const pArmies = state.armies.reduce((s, a, i) => s + (state.owner[i] === "p" ? a : 0), 0);
  const cArmies = state.armies.reduce((s, a, i) => s + (state.owner[i] === "c" ? a : 0), 0);

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case "reinforce": return "Reinforce";
      case "attack-from": case "attack-to": case "attack-roll": return "Attack";
      case "fortify-from": case "fortify-to": return "Fortify";
      case "cpu": return "CPU Turn";
      case "done": return "Game Over";
    }
  }, [state.phase]);

  const isClickable = (i: number): boolean => {
    if (state.phase === "done" || state.phase === "cpu") return false;
    if (state.phase === "reinforce") return state.owner[i] === "p";
    if (state.phase === "attack-from") return state.owner[i] === "p" && state.armies[i]! >= 2;
    if (state.phase === "attack-to") {
      if (state.owner[i] === "p") return state.armies[i]! >= 2;
      if (state.selected === null) return false;
      return ADJ[state.selected]!.includes(i);
    }
    if (state.phase === "attack-roll") return false;
    if (state.phase === "fortify-from") return state.owner[i] === "p" && state.armies[i]! >= 2;
    if (state.phase === "fortify-to") {
      if (state.owner[i] === "p") return state.armies[i]! >= 2 || (state.selected !== null && ADJ[state.selected]!.includes(i));
      return false;
    }
    return false;
  };

  const onTerrClick = (i: number): void => {
    if (!isClickable(i)) return;
    if (state.phase === "reinforce") {
      dispatch({ type: "placeOn", idx: i } as RiskActionAll);
      return;
    }
    dispatch({ type: "select", idx: i } as RiskActionAll);
  };

  // SVG positions for adjacency lines
  const lines = useMemo(() => {
    const out: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = [];
    for (let a = 0; a < ADJ.length; a++) {
      for (const b of ADJ[a]!) {
        if (b <= a) continue;
        const A = TERRITORY_LAYOUT[a]!;
        const B = TERRITORY_LAYOUT[b]!;
        out.push({
          x1: A.x * MAP_W, y1: A.y * MAP_H,
          x2: B.x * MAP_W, y2: B.y * MAP_H,
          key: `${a}-${b}`,
        });
      }
    }
    return out;
  }, []);

  const fortifyMax = state.selected !== null ? Math.max(1, state.armies[state.selected]! - 1) : 1;
  const fortifyAmtClamped = Math.min(fortifyAmt, fortifyMax);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "attack-roll" && (e.key === "r" || e.key === "R")) {
        e.preventDefault(); dispatch({ type: "rollAttack" } as RiskActionAll);
      } else if (state.phase === "reinforce" && (e.key === "Enter" || e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "endReinforce" } as RiskActionAll);
      } else if ((state.phase === "attack-from" || state.phase === "attack-to") && (e.key === "Escape" || e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "endAttack" } as RiskActionAll);
      } else if ((state.phase === "fortify-from" || state.phase === "fortify-to") && (e.key === "Escape" || e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "endFortify" } as RiskActionAll);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase]);

  return (
    <div className="riskmini-wrap">
      <div className="riskmini-hud">
        <div className="riskmini-hud-row">
          <div className="riskmini-phase-pill" data-phase={state.phase}>
            <span className="riskmini-phase-label">{phaseLabel}</span>
            <span className="riskmini-turn">Turn {state.turn} / {MAX_TURNS}</span>
          </div>
          {state.phase === "reinforce" && (
            <div className="riskmini-reserve">
              <span className="riskmini-reserve-label">Reserve</span>
              <span className="riskmini-reserve-count">{state.reserve}</span>
            </div>
          )}
        </div>
        <div className="riskmini-tally">
          <div className="riskmini-tally-side riskmini-tally-p">
            <span className="riskmini-tally-name">YOU</span>
            <span className="riskmini-tally-num">{pTerritories} terr</span>
            <span className="riskmini-tally-num">{pArmies} armies</span>
          </div>
          <div className="riskmini-tally-vs">vs</div>
          <div className="riskmini-tally-side riskmini-tally-c">
            <span className="riskmini-tally-name">CPU</span>
            <span className="riskmini-tally-num">{cTerritories} terr</span>
            <span className="riskmini-tally-num">{cArmies} armies</span>
          </div>
        </div>
      </div>

      <div className="riskmini-message">{state.message}</div>

      <div className="riskmini-map" role="grid">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="riskmini-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="riskmini-bg-grad" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#1a2742" />
              <stop offset="100%" stopColor="#0a1224" />
            </radialGradient>
            <pattern id="riskmini-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1f2d4d" opacity="0.6" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#riskmini-bg-grad)" />
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#riskmini-dots)" />
          {lines.map(l => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              className="riskmini-link"
              strokeDasharray="4 6" />
          ))}
          {state.armies.map((a, i) => {
            const pos = TERRITORY_LAYOUT[i]!;
            const cx = pos.x * MAP_W, cy = pos.y * MAP_H;
            const isSel = state.selected === i;
            const isTgt = state.target === i;
            const clickable = isClickable(i);
            const ownerCls = state.owner[i] === "p" ? "riskmini-terr-p" : "riskmini-terr-c";
            const stateCls = isSel ? "riskmini-terr-selected" : isTgt ? "riskmini-terr-target" : "";
            const interactCls = clickable ? "riskmini-terr-clickable" : "";
            return (
              <g key={i} className={`riskmini-terr ${ownerCls} ${stateCls} ${interactCls}`}
                onClick={() => onTerrClick(i)}
                onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onTerrClick(i); } }}
                tabIndex={clickable ? 0 : -1}
                role={clickable ? "button" : "gridcell"}
                aria-label={`${TERRITORY_NAMES[i]}, ${state.owner[i] === "p" ? "yours" : "CPU"}, ${a} armies${clickable ? " (press Enter)" : ""}`}>
                <polygon points={hexPoints(cx, cy, TERR_R).join(" ")}
                  className="riskmini-terr-hex" />
                <text x={cx} y={cy - 12} className="riskmini-terr-name" textAnchor="middle">
                  {TERRITORY_NAMES[i]}
                </text>
                <circle cx={cx} cy={cy + 12} r={18} className="riskmini-terr-badge" />
                <text x={cx} y={cy + 18} className="riskmini-terr-armies" textAnchor="middle">
                  {a}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dice Display */}
      {(state.attackerDice.length > 0 || state.phase === "attack-roll") && (
        <div className="riskmini-dice-panel">
          <div className="riskmini-dice-row">
            <span className="riskmini-dice-label riskmini-dice-label-att">Attacker</span>
            <div className="riskmini-dice-set">
              {state.attackerDice.length > 0
                ? state.attackerDice.map((d, i) => <Die key={`a${i}`} value={d} who="att" />)
                : <span className="riskmini-dice-pending">— roll to see —</span>}
            </div>
          </div>
          <div className="riskmini-dice-row">
            <span className="riskmini-dice-label riskmini-dice-label-def">Defender</span>
            <div className="riskmini-dice-set">
              {state.defenderDice.length > 0
                ? state.defenderDice.map((d, i) => <Die key={`d${i}`} value={d} who="def" />)
                : <span className="riskmini-dice-pending">— roll to see —</span>}
            </div>
          </div>
          {state.lastAttackLoss && (
            <div className="riskmini-dice-result">
              You lost <strong>{state.lastAttackLoss.att}</strong>, CPU lost <strong>{state.lastAttackLoss.def}</strong>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="riskmini-actions">
        {state.phase === "reinforce" && (
          <>
            {state.selected !== null && state.reserve > 0 && (
              <button className="riskmini-btn riskmini-btn-primary" onClick={() => dispatch({ type: "place" } as RiskActionAll)}>
                Place 1 Army on {TERRITORY_NAMES[state.selected]}
              </button>
            )}
            <button className="riskmini-btn riskmini-btn-ghost" onClick={() => dispatch({ type: "endReinforce" } as RiskActionAll)}>
              {state.reserve > 0 ? `Auto-place ${state.reserve} & Continue` : "Continue to Attack"}
            </button>
          </>
        )}
        {state.phase === "attack-from" && (
          <button className="riskmini-btn riskmini-btn-ghost" onClick={() => dispatch({ type: "endAttack" } as RiskActionAll)}>
            Skip Attack → Fortify
          </button>
        )}
        {state.phase === "attack-to" && (
          <button className="riskmini-btn riskmini-btn-ghost" onClick={() => dispatch({ type: "endAttack" } as RiskActionAll)}>
            Cancel & End Attack
          </button>
        )}
        {state.phase === "attack-roll" && (
          <>
            <button className="riskmini-btn riskmini-btn-attack" onClick={() => dispatch({ type: "rollAttack" } as RiskActionAll)}>
              Roll Dice & Attack!
            </button>
            <button className="riskmini-btn riskmini-btn-ghost" onClick={() => dispatch({ type: "endAttack" } as RiskActionAll)}>
              Cancel
            </button>
          </>
        )}
        {state.phase === "fortify-from" && (
          <button className="riskmini-btn riskmini-btn-ghost" onClick={() => dispatch({ type: "endFortify" } as RiskActionAll)}>
            Skip Fortify → End Turn
          </button>
        )}
        {state.phase === "fortify-to" && state.selected !== null && (
          <>
            {state.target !== null && (
              <div className="riskmini-fortify-amt">
                <label>Move</label>
                <input type="range" min={1} max={fortifyMax} value={fortifyAmtClamped}
                  onChange={(e) => setFortifyAmt(Number(e.target.value))} />
                <span className="riskmini-fortify-num">{fortifyAmtClamped}</span>
                <button className="riskmini-btn riskmini-btn-primary"
                  onClick={() => dispatch({ type: "fortify", amount: fortifyAmtClamped } as RiskActionAll)}>
                  Move {fortifyAmtClamped} → {TERRITORY_NAMES[state.target]}
                </button>
              </div>
            )}
            <button className="riskmini-btn riskmini-btn-ghost" onClick={() => dispatch({ type: "endFortify" } as RiskActionAll)}>
              End Turn
            </button>
          </>
        )}
        {state.phase === "cpu" && (
          <div className="riskmini-cpu-thinking">CPU is plotting...</div>
        )}
        {state.phase === "done" && (
          <div className="riskmini-done">
            <div className="riskmini-done-msg">{state.message}</div>
            <div className="riskmini-done-score">Score: {score(state)}</div>
          </div>
        )}
      </div>

      {/* Event log */}
      <div className="riskmini-log">
        <div className="riskmini-log-title">Battle Log</div>
        <ul>
          {state.log.map((entry, i) => (
            <li key={i} className={i === 0 ? "riskmini-log-newest" : ""}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function hexPoints(cx: number, cy: number, r: number): Array<string> {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6; // pointy-top
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts;
}
