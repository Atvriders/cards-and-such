import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ChinaHistoryQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChinaHistoryQuizSettings { questions: "10" | "20"; }
export interface ChinaHistoryQuizState { questions: ChinaHistoryQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChinaHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: ChinaHistoryQuizQuestion[] = [
  { question: "Who was the first emperor to unify China?", choices: ["Liu Bang","Qin Shi Huang","Han Wudi","Kublai Khan"], correct: 1 },
  { question: "The Great Wall was primarily built to defend against?", choices: ["Japanese pirates","Mongols/northern tribes","Russians","Vietnamese"], correct: 1 },
  { question: "Which dynasty followed the Qin?", choices: ["Tang","Song","Han","Ming"], correct: 2 },
  { question: "Confucius lived during which period?", choices: ["Spring & Autumn","Warring States","Han","Tang"], correct: 0 },
  { question: "The Forbidden City is located in?", choices: ["Xi'an","Nanjing","Beijing","Shanghai"], correct: 2 },
  { question: "Which dynasty was founded by Genghis Khan's grandson?", choices: ["Liao","Jin","Yuan","Qing"], correct: 2 },
  { question: "The Silk Road peaked under which dynasty?", choices: ["Han","Tang","Song","Ming"], correct: 1 },
  { question: "The last imperial dynasty was?", choices: ["Ming","Qing","Yuan","Tang"], correct: 1 },
  { question: "Sun Yat-sen founded the?", choices: ["Communist Party","Kuomintang","Boxer Society","Taiping Movement"], correct: 1 },
  { question: "Mao Zedong proclaimed the PRC in what year?", choices: ["1945","1949","1953","1958"], correct: 1 },
  { question: "The Long March took place in?", choices: ["1925","1934-35","1942","1950"], correct: 1 },
  { question: "Which philosophy emphasizes harmony with nature?", choices: ["Confucianism","Daoism","Legalism","Mohism"], correct: 1 },
  { question: "Paper-making was invented during the?", choices: ["Qin","Han","Tang","Song"], correct: 1 },
  { question: "Gunpowder was developed in the?", choices: ["Han","Tang","Song","Ming"], correct: 2 },
  { question: "The Terracotta Army guards whose tomb?", choices: ["Han Wudi","Qin Shi Huang","Tang Taizong","Kangxi"], correct: 1 },
  { question: "Which empress was the only one to rule China in her own name?", choices: ["Cixi","Wu Zetian","Yang Guifei","Xiao Yanyan"], correct: 1 },
  { question: "The Cultural Revolution began in?", choices: ["1958","1966","1971","1976"], correct: 1 },
  { question: "Hong Kong was returned to China in?", choices: ["1997","1999","2003","2008"], correct: 0 },
  { question: "The Three Kingdoms period followed which dynasty?", choices: ["Qin","Han","Tang","Sui"], correct: 1 },
  { question: "Marco Polo claimed to visit during which dynasty?", choices: ["Tang","Song","Yuan","Ming"], correct: 2 },
  { question: "The Boxer Rebellion targeted?", choices: ["The Qing","Foreigners and Christians","Communists","Republicans"], correct: 1 },
  { question: "Which canal connects Beijing with Hangzhou?", choices: ["Yangtze","Pearl","Grand Canal","Mekong"], correct: 2 },
  { question: "Tiananmen Square is in?", choices: ["Shanghai","Beijing","Xi'an","Chongqing"], correct: 1 },
  { question: "Deng Xiaoping introduced economic reforms starting in?", choices: ["1972","1978","1985","1992"], correct: 1 },
  { question: "The Opium Wars were fought in the?", choices: ["1700s","Mid 1800s","Early 1900s","Late 1800s"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChinaHistoryQuizSettings): ChinaHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChinaHistoryQuizState, action: ChinaHistoryQuizAction): ChinaHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChinaHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
