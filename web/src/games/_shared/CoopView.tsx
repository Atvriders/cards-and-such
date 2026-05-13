import { useEffect } from "react";
import type { CoopEngineConfig, CoopState } from "./coop-engine.js";

export interface CoopViewProps {
  prefix: string;
  cfg: CoopEngineConfig;
  state: CoopState;
  onPlay: (tacticId: string) => void;
  onGameOver: (score: number) => void;
  scoreFn: (s: CoopState) => { score: number; victory: boolean } | null;
  /** Optional flavor text shown above tactics */
  intro?: string;
}

export function CoopView({ prefix, cfg, state, onPlay, onGameOver, scoreFn, intro }: CoopViewProps): JSX.Element {
  const t = scoreFn(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const p = prefix;
  if (state.phase === "done" && t) {
    return (
      <div className={`${p}-wrap fade-in`}>
        <div className={`${p}-final bounce-in`}>
          <h2 className={`${p}-final-title`}>{t.victory ? "Mission Success!" : "Mission Over"}</h2>
          <div className={`${p}-final-score`}>Score: {t.score}</div>
          <div className={`${p}-final-stats`}>
            {cfg.progressLabel}: {state.progress} / {cfg.progressTarget} · {cfg.moraleLabel}: {state.morale} · {cfg.threatLabel}: {state.threat}
          </div>
        </div>
      </div>
    );
  }
  const progressPct = Math.min(100, (state.progress / cfg.progressTarget) * 100);
  const threatPct = Math.min(100, (state.threat / cfg.threatBreakpoint) * 100);
  return (
    <div className={`${p}-wrap fade-in`}>
      <div className={`${p}-header`}>
        <span className={`${p}-icon`}>{cfg.scenarioEmoji}</span>
        <span className={`${p}-scenario`}>{cfg.scenarioLabel}</span>
        <span className={`${p}-round`}>Round {state.round}/{cfg.totalRounds}</span>
      </div>
      {intro && <div className={`${p}-intro`}>{intro}</div>}
      <div className={`${p}-bars`}>
        <div className={`${p}-bar`}>
          <div className={`${p}-bar-label`}>{cfg.progressLabel} {state.progress} / {cfg.progressTarget}</div>
          <div className={`${p}-bar-track`}><div className={`${p}-bar-fill ${p}-bar-good`} style={{ width: progressPct + "%" }} /></div>
        </div>
        <div className={`${p}-bar`}>
          <div className={`${p}-bar-label`}>{cfg.threatLabel} {state.threat} / {cfg.threatBreakpoint}</div>
          <div className={`${p}-bar-track`}><div className={`${p}-bar-fill ${p}-bar-bad`} style={{ width: threatPct + "%" }} /></div>
        </div>
        <div className={`${p}-morale`}>{cfg.moraleLabel}: {"❤".repeat(Math.max(0, state.morale))}{"·".repeat(Math.max(0, cfg.startMorale - state.morale))}</div>
      </div>
      {state.lastTactic && (
        <div className={`${p}-last`}>Last: +{state.lastEffort} you · +{state.lastAlly} ally · {cfg.threatLabel} +{state.lastThreatGain}</div>
      )}
      <div className={`${p}-tactics`}>
        {cfg.tactics.map(tac => (
          <button
            key={tac.id}
            className={`${p}-tactic`}
            onClick={() => onPlay(tac.id)}
            disabled={state.phase !== "choose"}
            type="button"
            title={tac.desc}
            data-testid={`hint-target-coop-tactic-${tac.id}`}
          >
            <div className={`${p}-tactic-emoji`}>{tac.emoji}</div>
            <div className={`${p}-tactic-name`}>{tac.label}</div>
            <div className={`${p}-tactic-meta`}>~{tac.effort} effort · {Math.round(tac.reliability * 100)}%</div>
            <div className={`${p}-tactic-desc`}>{tac.desc}</div>
          </button>
        ))}
      </div>
      {state.log.length > 0 && (
        <ul className={`${p}-log`}>
          {state.log.map((line, i) => <li key={i} className={`${p}-log-line`}>{line}</li>)}
        </ul>
      )}
    </div>
  );
}
