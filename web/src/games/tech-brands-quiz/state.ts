import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TechBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface TechBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TechBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Apple was co-founded by Steve Jobs and?", choices: ["Bill Gates", "Steve Wozniak", "Larry Page", "Paul Allen"], correct: 1 },
  { question: "Microsoft was founded in?", choices: ["1971", "1975", "1980", "1985"], correct: 1 },
  { question: "Google was founded by Page and?", choices: ["Sergey Brin", "Eric Schmidt", "Sundar Pichai", "Marc Andreessen"], correct: 0 },
  { question: "Amazon started by selling?", choices: ["Books", "Music", "Toys", "Computers"], correct: 0 },
  { question: "Meta's previous name?", choices: ["MySpace", "Friendster", "Facebook", "Instagram"], correct: 2 },
  { question: "IBM stands for?", choices: ["Internet Business Machines", "International Business Machines", "Integrated Binary Methods", "Industrial Business Manufacturing"], correct: 1 },
  { question: "Tesla was founded in?", choices: ["2001", "2003", "2007", "2010"], correct: 1 },
  { question: "Tim Cook is CEO of?", choices: ["Microsoft", "Apple", "Amazon", "Google"], correct: 1 },
  { question: "Sundar Pichai leads which company?", choices: ["Microsoft", "Apple", "Google/Alphabet", "Meta"], correct: 2 },
  { question: "Satya Nadella took over Microsoft in?", choices: ["2010", "2014", "2016", "2018"], correct: 1 },
  { question: "Netflix started as a?", choices: ["Streaming app", "DVD-by-mail service", "Cable channel", "Game studio"], correct: 1 },
  { question: "Twitter was originally limited to how many characters?", choices: ["100", "140", "160", "200"], correct: 1 },
  { question: "Intel is famous for making?", choices: ["Software", "Microprocessors", "Phones", "Networks"], correct: 1 },
  { question: "NVIDIA is best known for?", choices: ["Phones", "GPUs", "Servers", "Routers"], correct: 1 },
  { question: "Oracle is led by founder?", choices: ["Larry Page", "Larry Ellison", "Bill Gates", "Steve Ballmer"], correct: 1 },
  { question: "Spotify is from which country?", choices: ["USA", "Sweden", "Finland", "UK"], correct: 1 },
  { question: "Slack is a?", choices: ["Game engine", "Workplace messaging app", "Photo editor", "Music tool"], correct: 1 },
  { question: "Adobe is famous for?", choices: ["Search", "Creative software", "Cloud servers", "Phones"], correct: 1 },
  { question: "Dropbox was founded by?", choices: ["Drew Houston", "Marc Benioff", "Brian Chesky", "Jack Dorsey"], correct: 0 },
  { question: "Airbnb was founded in?", choices: ["2005", "2008", "2010", "2012"], correct: 1 },
  { question: "LinkedIn was founded by?", choices: ["Reid Hoffman", "Jack Dorsey", "Brian Acton", "Kevin Systrom"], correct: 0 },
  { question: "Instagram was acquired by Meta in?", choices: ["2010", "2012", "2014", "2016"], correct: 1 },
  { question: "WhatsApp founders sold to Facebook for ~?", choices: ["$1B", "$10B", "$19B", "$25B"], correct: 2 },
  { question: "Salesforce CEO Marc?", choices: ["Andreessen", "Benioff", "Cuban", "Zuckerberg"], correct: 1 },
  { question: "Snap Inc. is parent of?", choices: ["Snapchat", "WhatsApp", "Discord", "Telegram"], correct: 0 },
  { question: "Zoom became famous during?", choices: ["Y2K", "2008 crash", "COVID-19 pandemic", "Dot-com bust"], correct: 2 },
  { question: "Reddit was founded in?", choices: ["2003", "2005", "2007", "2010"], correct: 1 },
  { question: "Sony is headquartered in?", choices: ["China", "Japan", "South Korea", "USA"], correct: 1 },
  { question: "Samsung is from?", choices: ["Japan", "South Korea", "Taiwan", "China"], correct: 1 },
  { question: "ByteDance owns?", choices: ["Snapchat", "TikTok", "Twitter", "Weibo"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TechBrandsQuizSettings): TechBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TechBrandsQuizState, action: TechBrandsQuizAction): TechBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TechBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
