import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SiliconValleyQuizSettings { questions: "10" | "20" | "30"; }
export interface SiliconValleyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SiliconValleyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who founded Apple?", choices: ["Jobs and Wozniak", "Gates and Allen", "Page and Brin", "Hewlett and Packard"], correct: 0 },
  { question: "Who founded Hewlett-Packard?", choices: ["Hewlett and Packard", "Jobs and Woz", "Page and Brin", "Yang and Filo"], correct: 0 },
  { question: "Where is the iconic HP garage?", choices: ["Palo Alto", "Cupertino", "Mountain View", "San Francisco"], correct: 0 },
  { question: "Who founded Intel?", choices: ["Gordon Moore et al", "Steve Jobs", "Larry Ellison", "Tim Cook"], correct: 0 },
  { question: "What is the company called the 'Traitorous Eight'?", choices: ["Apple", "Google", "Fairchild Semiconductor (founders)", "Oracle"], correct: 2 },
  { question: "Who founded Oracle?", choices: ["Larry Ellison", "Bill Gates", "Steve Jobs", "Marc Benioff"], correct: 0 },
  { question: "What company is in Menlo Park (Meta's HQ)?", choices: ["Apple", "Facebook (Meta)", "Google", "Tesla"], correct: 1 },
  { question: "Where is Apple headquartered?", choices: ["Cupertino", "Palo Alto", "Mountain View", "San Jose"], correct: 0 },
  { question: "Where is Google's main HQ (Googleplex)?", choices: ["Mountain View", "Cupertino", "San Francisco", "Palo Alto"], correct: 0 },
  { question: "Who founded LinkedIn?", choices: ["Reid Hoffman", "Marc Benioff", "Marc Andreessen", "Mark Zuckerberg"], correct: 0 },
  { question: "Who founded Salesforce?", choices: ["Marc Benioff", "Larry Ellison", "Reid Hoffman", "Page and Brin"], correct: 0 },
  { question: "Who founded Tesla Motors (originally)?", choices: ["Eberhard and Tarpenning", "Elon Musk", "Larry Page", "Steve Jobs"], correct: 0 },
  { question: "Who founded SpaceX?", choices: ["Elon Musk", "Jeff Bezos", "Richard Branson", "Larry Page"], correct: 0 },
  { question: "Who founded Airbnb?", choices: ["Chesky, Gebbia, Blecharczyk", "Travis Kalanick", "Drew Houston", "Brian Armstrong"], correct: 0 },
  { question: "Who founded Uber?", choices: ["Travis Kalanick and Garrett Camp", "Brian Chesky", "Drew Houston", "Daniel Ek"], correct: 0 },
  { question: "Who founded Dropbox?", choices: ["Drew Houston and Arash Ferdowsi", "Travis Kalanick", "Marc Andreessen", "Reid Hoffman"], correct: 0 },
  { question: "Where is Facebook headquartered?", choices: ["Menlo Park", "Cupertino", "San Jose", "Sunnyvale"], correct: 0 },
  { question: "Where is Stanford University, the heart of the Valley?", choices: ["Stanford / Palo Alto area", "San Jose", "Cupertino", "Berkeley"], correct: 0 },
  { question: "Who is famous for 'the next big thing' Y Combinator?", choices: ["Paul Graham (cofounder)", "Marc Andreessen", "Reid Hoffman", "Elon Musk"], correct: 0 },
  { question: "Who founded Andreessen Horowitz?", choices: ["Marc Andreessen and Ben Horowitz", "Reid Hoffman", "Peter Thiel", "Paul Graham"], correct: 0 },
  { question: "Who founded PayPal (key cofounder, 'PayPal mafia')?", choices: ["Peter Thiel and Elon Musk among others", "Mark Zuckerberg", "Travis Kalanick", "Steve Wozniak"], correct: 0 },
  { question: "What was Apple's first product?", choices: ["Apple I (computer)", "iPod", "iPhone", "Apple Lisa"], correct: 0 },
  { question: "Steve Jobs's famous black turtleneck designer?", choices: ["Issey Miyake", "Yves Saint Laurent", "Tom Ford", "Levi Strauss"], correct: 0 },
  { question: "Who founded Yahoo?", choices: ["Jerry Yang and David Filo", "Page and Brin", "Bezos", "Gates"], correct: 0 },
  { question: "Who founded eBay?", choices: ["Pierre Omidyar", "Travis Kalanick", "Reid Hoffman", "Pete Thiel"], correct: 0 },
  { question: "Who founded Nvidia?", choices: ["Jensen Huang et al", "Steve Jobs", "Andy Grove", "Larry Page"], correct: 0 },
  { question: "Where is Nvidia headquartered?", choices: ["Santa Clara", "Cupertino", "Mountain View", "San Francisco"], correct: 0 },
  { question: "Who founded Adobe?", choices: ["Warnock and Geschke", "Gates and Allen", "Jobs and Woz", "Page and Brin"], correct: 0 },
  { question: "Where did Sand Hill Road get its name?", choices: ["Famous VC street", "Beachfront", "Grocer's row", "Computer history museum row"], correct: 0 },
  { question: "Which company makes the M-series Apple silicon?", choices: ["Apple (designs in-house)", "Intel", "Nvidia", "AMD"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SiliconValleyQuizSettings): SiliconValleyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SiliconValleyQuizState, action: SiliconValleyQuizAction): SiliconValleyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SiliconValleyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
