import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BulletTrainsQuizSettings { questions: "10" | "20" | "30"; }
export interface BulletTrainsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BulletTrainsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Shinkansen opened in?", choices: ["1958", "1964", "1972", "1980"], correct: 1 },
  { question: "First Shinkansen line ran between?", choices: ["Tokyo–Osaka", "Tokyo–Kyoto", "Osaka–Kobe", "Tokyo–Hakata"], correct: 0 },
  { question: "TGV first opened (Paris–Lyon) in?", choices: ["1971", "1981", "1991", "2001"], correct: 1 },
  { question: "TGV record speed (km/h)?", choices: ["350", "420", "574", "620"], correct: 2 },
  { question: "ICE is operated by?", choices: ["SNCF", "DB", "SBB", "Renfe"], correct: 1 },
  { question: "AVE high-speed runs in?", choices: ["France", "Italy", "Spain", "Germany"], correct: 2 },
  { question: "China high-speed network is the world?", choices: ["10th", "5th", "Largest", "Smallest"], correct: 2 },
  { question: "Eurostar links?", choices: ["Paris–Brussels–London", "London–Edinburgh", "Madrid–Paris", "Rome–Milan"], correct: 0 },
  { question: "Shinkansen E5 series top revenue speed (km/h)?", choices: ["260", "300", "320", "360"], correct: 2 },
  { question: "Maglev Shanghai connects?", choices: ["Pudong–Hongqiao", "Pudong–airport", "Beijing–Tianjin", "Hong Kong–Shenzhen"], correct: 1 },
  { question: "Maglev Chuo Shinkansen target speed (km/h)?", choices: ["400", "505", "600", "700"], correct: 1 },
  { question: "KTX is from which country?", choices: ["Japan", "South Korea", "China", "Taiwan"], correct: 1 },
  { question: "Frecciarossa runs in?", choices: ["Spain", "Italy", "France", "Greece"], correct: 1 },
  { question: "Acela operates between?", choices: ["Boston–DC", "LA–SF", "NYC–Toronto", "Miami–Atlanta"], correct: 0 },
  { question: "Acela top speed (mph)?", choices: ["125", "135", "150", "165"], correct: 2 },
  { question: "Eurostar e320 can reach (km/h)?", choices: ["250", "300", "320", "350"], correct: 2 },
  { question: "Most Shinkansen tracks are gauge?", choices: ["Narrow", "Standard", "Broad", "Mixed"], correct: 1 },
  { question: "Conventional JR lines are gauge?", choices: ["Narrow (1067 mm)", "Standard", "Broad", "Cape gauge"], correct: 0 },
  { question: "ICE 3 power output (MW)?", choices: ["4", "6", "8", "10"], correct: 2 },
  { question: "Bullet train nickname comes from?", choices: ["Sound", "Shape", "Speed", "All"], correct: 3 },
  { question: "\"Nozomi\" service is?", choices: ["Local", "Limited express", "Fastest", "Slowest"], correct: 2 },
  { question: "Hakone is on which line?", choices: ["Tokaido Shinkansen", "Sanyo", "Joetsu", "Tohoku"], correct: 0 },
  { question: "China G-class trains run at up to (km/h)?", choices: ["250", "300", "350", "380"], correct: 2 },
  { question: "\"Fuxing\" is China?", choices: ["Type", "High-speed train brand", "Operator", "Track"], correct: 1 },
  { question: "\"Harmony\" trains came from?", choices: ["Domestic", "Imports/JV", "Maglev", "Local"], correct: 1 },
  { question: "Italy NTV/Italo competes with?", choices: ["DB", "SNCF", "Trenitalia", "Renfe"], correct: 2 },
  { question: "Japan 0 Series ran from?", choices: ["1964", "1968", "1972", "1980"], correct: 0 },
  { question: "Linear Chuo to open Tokyo–Nagoya?", choices: ["2025", "2027", "2030+", "2040"], correct: 2 },
  { question: "TGV INOUI is a?", choices: ["Network", "Brand", "Speed record", "Track"], correct: 1 },
  { question: "Eurostar tunnel is the?", choices: ["Channel Tunnel", "Severn", "Mont Blanc", "Gotthard"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BulletTrainsQuizSettings): BulletTrainsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BulletTrainsQuizState, action: BulletTrainsQuizAction): BulletTrainsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BulletTrainsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
