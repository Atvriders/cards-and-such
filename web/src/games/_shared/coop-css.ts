// Generate the per-game scoped CSS for CoopView. Each game has a unique
// prefix so styles never leak across the catalog.
export function coopCss(prefix: string, accent: string, bg: string): string {
  const p = prefix;
  return `
.${p}-wrap{font-family:'Inter',system-ui,sans-serif;max-width:680px;margin:0 auto;padding:18px;display:flex;flex-direction:column;gap:14px;color:#0f172a;background:${bg};border-radius:14px}
.${p}-header{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.05rem}
.${p}-icon{font-size:1.6rem}
.${p}-scenario{flex:1;color:${accent}}
.${p}-round{font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:#475569;background:#fff;padding:2px 8px;border-radius:6px;border:1px solid #cbd5e1}
.${p}-intro{font-size:0.9rem;color:#475569;background:rgba(255,255,255,0.6);padding:10px;border-radius:8px;border-left:3px solid ${accent}}
.${p}-bars{display:flex;flex-direction:column;gap:6px}
.${p}-bar-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:#334155;margin-bottom:2px}
.${p}-bar-track{height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden}
.${p}-bar-fill{height:100%;transition:width 200ms ease}
.${p}-bar-good{background:linear-gradient(90deg,#10b981,#059669)}
.${p}-bar-bad{background:linear-gradient(90deg,#f59e0b,#dc2626)}
.${p}-morale{font-size:1rem;color:#dc2626;letter-spacing:2px;font-family:'JetBrains Mono',monospace}
.${p}-last{font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#475569;background:#fff;padding:6px 10px;border-radius:6px;border:1px solid #cbd5e1}
.${p}-tactics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.${p}-tactic{cursor:pointer;text-align:left;padding:10px;border-radius:10px;background:#fff;border:2px solid transparent;transition:all 150ms;display:flex;flex-direction:column;gap:2px;font-family:'Inter',system-ui,sans-serif}
.${p}-tactic:hover:not(:disabled){border-color:${accent};transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.${p}-tactic:disabled{opacity:0.5;cursor:not-allowed}
.${p}-tactic-emoji{font-size:1.4rem}
.${p}-tactic-name{font-weight:700;color:${accent}}
.${p}-tactic-meta{font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:#64748b}
.${p}-tactic-desc{font-size:0.78rem;color:#475569;line-height:1.3}
.${p}-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;max-height:140px;overflow-y:auto}
.${p}-log-line{font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:#64748b;padding:3px 6px;border-radius:4px;background:rgba(255,255,255,0.5)}
.${p}-final{text-align:center;padding:24px;background:#fff;border-radius:14px}
.${p}-final-title{margin:0 0 8px;color:${accent}}
.${p}-final-score{font-family:'JetBrains Mono',monospace;font-size:1.8rem;font-weight:900;color:${accent}}
.${p}-final-stats{margin-top:8px;font-size:0.85rem;color:#64748b;font-family:'JetBrains Mono',monospace}
`;
}

export function quizCss(prefix: string, accent: string, bg: string): string {
  const p = prefix;
  return `
.${p}-wrap{font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;display:flex;flex-direction:column;gap:14px;color:#0f172a;background:${bg};border-radius:14px}
.${p}-header{display:flex;align-items:center;justify-content:space-between;font-weight:700}
.${p}-progress{font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:#475569}
.${p}-score{font-family:'JetBrains Mono',monospace;font-size:0.9rem;color:${accent};font-weight:700}
.${p}-q{font-size:1.1rem;font-weight:600;line-height:1.4;padding:14px;background:#fff;border-radius:10px;border-left:4px solid ${accent}}
.${p}-choices{display:flex;flex-direction:column;gap:8px}
.${p}-choice{cursor:pointer;text-align:left;padding:12px 14px;border-radius:10px;background:#fff;border:2px solid #e2e8f0;font-family:'Inter',system-ui,sans-serif;font-size:1rem;transition:all 120ms;color:#0f172a}
.${p}-choice:hover:not(:disabled){border-color:${accent};background:#f8fafc}
.${p}-choice:disabled{cursor:not-allowed}
.${p}-choice.${p}-correct{background:#dcfce7;border-color:#16a34a;color:#15803d}
.${p}-choice.${p}-wrong{background:#fee2e2;border-color:#dc2626;color:#991b1b}
.${p}-feedback{font-weight:700;text-align:center;padding:12px;border-radius:10px}
.${p}-feedback.${p}-good{background:#dcfce7;color:#15803d}
.${p}-feedback.${p}-bad{background:#fee2e2;color:#991b1b}
.${p}-next{cursor:pointer;padding:10px 24px;border-radius:8px;background:${accent};color:#fff;border:none;font-weight:700;font-size:1rem;align-self:center}
.${p}-final{text-align:center;padding:24px;background:#fff;border-radius:14px}
.${p}-final-title{margin:0 0 8px;color:${accent}}
.${p}-final-score{font-family:'JetBrains Mono',monospace;font-size:1.8rem;font-weight:900;color:${accent}}
.${p}-streak{font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#64748b}
`;
}
