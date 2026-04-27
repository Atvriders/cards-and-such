import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EntrepreneursQuizSettings { questions: "10" | "20" | "30"; }
export interface EntrepreneursQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EntrepreneursQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Amazon founder?", choices: ["Bezos", "Gates", "Musk", "Page"], correct: 0 },
  { question: "Microsoft co-founder (with Gates)?", choices: ["Allen", "Wozniak", "Jobs", "Ballmer"], correct: 0 },
  { question: "Apple co-founders Steves?", choices: ["Jobs & Wozniak", "Jobs & Ballmer", "Wozniak & Allen", "Jobs & Berners"], correct: 0 },
  { question: "Tesla's CEO is?", choices: ["Bezos", "Musk", "Page", "Cuban"], correct: 1 },
  { question: "Virgin Group is led by?", choices: ["Branson", "Soros", "Cuban", "Buffett"], correct: 0 },
  { question: "Walmart was founded by?", choices: ["Sam Walton", "Sam Bezos", "Sam Buffett", "Sam Cooke"], correct: 0 },
  { question: "Walt Disney co-founded with?", choices: ["Roy Disney", "Mickey Disney", "Ron Disney", "Pat Disney"], correct: 0 },
  { question: "Henry Ford built which company?", choices: ["Ford Motor", "GM", "Chrysler", "Stellantis"], correct: 0 },
  { question: "Berkshire Hathaway is led by?", choices: ["Buffett", "Ackman", "Icahn", "Soros"], correct: 0 },
  { question: "Mark Zuckerberg co-founded what?", choices: ["Facebook/Meta", "Twitter", "Snap", "TikTok"], correct: 0 },
  { question: "Twitter (X) co-founder?", choices: ["Dorsey", "Ev Williams", "Both", "Neither"], correct: 2 },
  { question: "Larry Page co-founded?", choices: ["Yahoo", "Google", "AOL", "AltaVista"], correct: 1 },
  { question: "Sergey Brin co-founded?", choices: ["Google", "Facebook", "PayPal", "eBay"], correct: 0 },
  { question: "Elon Musk co-founded which payment company?", choices: ["Stripe", "Square", "PayPal", "Venmo"], correct: 2 },
  { question: "Brian Chesky co-founded?", choices: ["Airbnb", "Lyft", "Uber", "WeWork"], correct: 0 },
  { question: "Travis Kalanick co-founded?", choices: ["Lyft", "Uber", "Bolt", "DoorDash"], correct: 1 },
  { question: "Reed Hastings co-founded?", choices: ["Disney+", "Netflix", "Prime", "Hulu"], correct: 1 },
  { question: "Howard Schultz built?", choices: ["Starbucks", "Dunkin", "Tim Hortons", "Peet's"], correct: 0 },
  { question: "Ray Kroc grew?", choices: ["Wendy's", "McDonald's", "KFC", "Burger King"], correct: 1 },
  { question: "Phil Knight co-founded?", choices: ["Adidas", "Nike", "Reebok", "Under Armour"], correct: 1 },
  { question: "Estée Lauder built?", choices: ["Cosmetics empire", "Fashion empire", "Apparel empire", "Bookselling empire"], correct: 0 },
  { question: "Coco Chanel built?", choices: ["Beauty / fashion", "Cars", "Phones", "Books"], correct: 0 },
  { question: "Oprah Winfrey is famous as?", choices: ["Media mogul", "Oil tycoon", "Banker", "Athlete"], correct: 0 },
  { question: "Steve Ross built?", choices: ["Time Warner", "Disney", "Sony", "Viacom"], correct: 0 },
  { question: "Ted Turner founded?", choices: ["CNN", "MTV", "ESPN", "Fox"], correct: 0 },
  { question: "Larry Ellison founded?", choices: ["Oracle", "Sun", "IBM", "SAP"], correct: 0 },
  { question: "Michael Dell founded?", choices: ["Dell", "HP", "Compaq", "Gateway"], correct: 0 },
  { question: "Reid Hoffman co-founded?", choices: ["LinkedIn", "Facebook", "Twitter", "Snap"], correct: 0 },
  { question: "Marc Benioff founded?", choices: ["Salesforce", "Workday", "Oracle", "SAP"], correct: 0 },
  { question: "Daniel Ek co-founded?", choices: ["Spotify", "Pandora", "Apple Music", "Tidal"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EntrepreneursQuizSettings): EntrepreneursQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EntrepreneursQuizState, action: EntrepreneursQuizAction): EntrepreneursQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EntrepreneursQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
