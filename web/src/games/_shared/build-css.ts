// Helper: builds CSS string for a heads-up trick game given a prefix and accent.
export function buildHuCss(prefix: string, accent: string): string {
  return `
.${prefix}-wrap { display:flex; flex-direction:column; gap:0.75rem; padding:1rem; min-height:100%; background: linear-gradient(180deg,#0a3d2c,#072019); color:#f5f5f5; font-family: system-ui, sans-serif; }
.${prefix}-title { font-size:1.1rem; font-weight:700; color:${accent}; text-align:center; }
.${prefix}-header { display:flex; justify-content:space-around; gap:0.5rem; padding:0.5rem; background:rgba(0,0,0,0.3); border-radius:6px; font-size:0.9rem; }
.${prefix}-cpu, .${prefix}-trick, .${prefix}-player { display:flex; flex-direction:column; align-items:center; gap:0.4rem; }
.${prefix}-label { font-size:0.75rem; opacity:0.7; text-transform:uppercase; letter-spacing:0.05rem; }
.${prefix}-back-row, .${prefix}-trick-row, .${prefix}-hand { display:flex; gap:0.3rem; flex-wrap:wrap; justify-content:center; min-height:4.5rem; }
.${prefix}-back { width:2.6rem; height:3.8rem; border-radius:4px; background: repeating-linear-gradient(45deg, ${accent} 0 4px, #112 4px 8px); border:1px solid #fff3; }
.${prefix}-empty { opacity:0.5; }
.${prefix}-trick-slot { display:flex; flex-direction:column; align-items:center; gap:0.2rem; }
.${prefix}-slot-label { font-size:0.7rem; opacity:0.7; }
.${prefix}-status { text-align:center; padding:0.5rem; background:rgba(255,255,255,0.05); border-radius:6px; min-height:2rem; font-style:italic; }
.${prefix}-hand .card { cursor: pointer; transition: transform 0.1s; }
.${prefix}-hand .card:hover { transform: translateY(-6px); }
.${prefix}-dim { opacity:0.4; cursor:not-allowed; }
.${prefix}-result { background:rgba(0,0,0,0.5); padding:1rem; border-radius:8px; text-align:center; border:2px solid ${accent}; }
.${prefix}-result h2 { margin:0 0 0.5rem 0; color:${accent}; }
.${prefix}-btn { background:${accent}; color:#000; padding:0.5rem 1rem; border:none; border-radius:6px; font-weight:600; cursor:pointer; }
.${prefix}-btn:hover { filter:brightness(1.15); }
.${prefix}-btn.alt { background:#444; color:#fff; }
.${prefix}-actions { display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; }
`;
}
