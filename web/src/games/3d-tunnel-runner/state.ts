import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThreedTunnelRunnerSettings { questions: "10"; }
export interface ThreedTunnelRunnerState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThreedTunnelRunnerAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: '3D Tunnel Runners typically have how many lanes?', choices: ['Three lanes', 'One lane', 'Five lanes', 'Ten lanes'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The main input mechanic is?', choices: ['Swipe/tap to switch lanes', 'Type a word', 'Drag tiles', 'Roll dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Subway Surfers is a famous?', choices: ['3D endless tunnel/track runner', 'Trick-taking card game', 'Solitaire', 'Bridge variant'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Visual signature of tunnel runners is often?', choices: ['A rotating or twisting tunnel/track', 'Static side-view', 'Top-down board', 'Iso 3/4 view'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Difficulty in tunnel runners typically?', choices: ['Ramps up with distance and speed', 'Stays the same', 'Decreases', 'Is decided by dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Death/loss occurs when?', choices: ['The player hits an obstacle', 'The player rests too long', 'A timer runs out only', 'Trump is broken'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Subway Surfers was first released in?', choices: ['2012', '1985', '2000', '2022'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Power-ups in tunnel runners often include?', choices: ['Magnets, jetpacks, and shoes', 'Trump cards', 'Tile melds', 'Wild jokers'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: '3D Tunnel Runners are descended from?', choices: ['Tube-style early arcade tunnels and modern endless runners', 'Klondike', 'Whist', 'Bridge'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tunnel rotation often produces?', choices: ['A vertigo-inducing or hypnotic effect', 'Player nausea is undocumented', 'Slower pace always', 'Lower scores always'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ThreedTunnelRunnerSettings): ThreedTunnelRunnerState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThreedTunnelRunnerState, action: ThreedTunnelRunnerAction): ThreedTunnelRunnerState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThreedTunnelRunnerState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
