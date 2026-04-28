import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FacebookHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface FacebookHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FacebookHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Facebook was founded in what year?", choices: ["2003","2004","2005","2006"], correct: 1 },
  { question: "Facebook was founded at which university?", choices: ["Yale","Princeton","Harvard","MIT"], correct: 2 },
  { question: "Facebook was originally called?", choices: ["TheFacebook","Facemash","FBook","Connect"], correct: 0 },
  { question: "Facebook's IPO was in?", choices: ["2010","2011","2012","2013"], correct: 2 },
  { question: "Facebook acquired Instagram in?", choices: ["2010","2012","2014","2016"], correct: 1 },
  { question: "Facebook acquired WhatsApp in?", choices: ["2012","2014","2016","2018"], correct: 1 },
  { question: "Facebook acquired Oculus in?", choices: ["2012","2014","2016","2018"], correct: 1 },
  { question: "Facebook rebranded to Meta in?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "Meta's COO who left in 2022 was?", choices: ["Sheryl Sandberg","Marne Levine","Andrew Bosworth","Adam Mosseri"], correct: 0 },
  { question: "Mark Zuckerberg's first co-founder was?", choices: ["Eduardo Saverin","Dustin Moskovitz","Chris Hughes","All of the above co-founded"], correct: 3 },
  { question: "Cambridge Analytica scandal broke in?", choices: ["2016","2017","2018","2019"], correct: 2 },
  { question: "Threads launched in?", choices: ["2022","2023","2024","2025"], correct: 1 },
  { question: "Meta's HQ is in?", choices: ["Palo Alto","Menlo Park","Mountain View","San Francisco"], correct: 1 },
  { question: "Facebook's first office was in?", choices: ["Cambridge MA","Palo Alto","New York","Boston"], correct: 1 },
  { question: "What was 'Facemash' originally?", choices: ["Hot-or-not site","Photo sharing","Class roster","Yearbook scan"], correct: 0 },
  { question: "Facebook reached 1 billion monthly users in?", choices: ["2010","2012","2014","2016"], correct: 1 },
  { question: "Meta's Llama LLMs first released in?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Facebook's first major design change was the introduction of?", choices: ["News Feed","Like button","Stories","Reactions"], correct: 0 },
  { question: "The original Facebook movie 'The Social Network' was released in?", choices: ["2008","2010","2012","2014"], correct: 1 },
  { question: "Facebook's blue color choice was reportedly because Zuckerberg is?", choices: ["Red-green colorblind","A cat lover","Inspired by Yale","From California"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FacebookHistoryQuizSettings): FacebookHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FacebookHistoryQuizState, action: FacebookHistoryQuizAction): FacebookHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FacebookHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
