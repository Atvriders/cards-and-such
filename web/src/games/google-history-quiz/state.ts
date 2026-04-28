import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GoogleHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface GoogleHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GoogleHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Google was founded in what year?", choices: ["1996","1998","2000","2002"], correct: 1 },
  { question: "Google was founded by Larry Page and?", choices: ["Sergey Brin","Eric Schmidt","Sundar Pichai","Marissa Mayer"], correct: 0 },
  { question: "Google was originally called?", choices: ["BackRub","PageRank","Stanford Search","GoogolPlex"], correct: 0 },
  { question: "Gmail launched in?", choices: ["2002","2004","2006","2008"], correct: 1 },
  { question: "YouTube was acquired by Google in?", choices: ["2005","2006","2007","2008"], correct: 1 },
  { question: "Android was acquired by Google in?", choices: ["2003","2005","2007","2009"], correct: 1 },
  { question: "Sundar Pichai became Google CEO in?", choices: ["2013","2015","2017","2019"], correct: 1 },
  { question: "Alphabet was created as parent company in?", choices: ["2013","2015","2017","2019"], correct: 1 },
  { question: "Google's IPO was in?", choices: ["2002","2004","2006","2008"], correct: 1 },
  { question: "Chrome browser launched in?", choices: ["2006","2008","2010","2012"], correct: 1 },
  { question: "Google Maps launched in?", choices: ["2003","2005","2007","2009"], correct: 1 },
  { question: "Google's HQ is informally called?", choices: ["The Plex","Googleplex","G-Park","Mountain View Park"], correct: 1 },
  { question: "Eric Schmidt was Google CEO from?", choices: ["1998-2001","2001-2011","2003-2013","2005-2015"], correct: 1 },
  { question: "Google's mission statement starts with which words?", choices: ["Don't be evil","Organize the world's information","Make the world a better place","Build for everyone"], correct: 1 },
  { question: "Google Glass was unveiled in?", choices: ["2010","2012","2014","2016"], correct: 1 },
  { question: "Google's autonomous vehicle project was called?", choices: ["Waymo","Stuga","Self-Drive","AutoG"], correct: 0 },
  { question: "Google Bard launched in?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Bard was renamed to?", choices: ["Gemini","DeepMind","PaLM","AI Studio"], correct: 0 },
  { question: "Google acquired DoubleClick in?", choices: ["2005","2007","2009","2011"], correct: 1 },
  { question: "Google's first April Fools' joke gag was?", choices: ["Mentalplex (2000)","Gmail Paper","Google Translate Animals","PigeonRank"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GoogleHistoryQuizSettings): GoogleHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GoogleHistoryQuizState, action: GoogleHistoryQuizAction): GoogleHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GoogleHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
