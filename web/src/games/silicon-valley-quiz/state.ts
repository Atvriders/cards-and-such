import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SiliconValleyQuizSettings { questions: "10" | "20" | "30"; }
export interface SiliconValleyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SiliconValleyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who co-founded Apple Computer in 1976?", choices: ["Steve Jobs and Steve Wozniak", "Bill Gates and Paul Allen", "Larry Page and Sergey Brin", "William Hewlett and David Packard"], correct: 0 },
  { question: "Hewlett-Packard was founded by whom?", choices: ["William Hewlett and David Packard", "Steve Jobs and Steve Wozniak", "Larry Page and Sergey Brin", "Jerry Yang and David Filo"], correct: 0 },
  { question: "In which city is the iconic HP garage located?", choices: ["Palo Alto", "Cupertino", "Mountain View", "San Francisco"], correct: 0 },
  { question: "Intel was co-founded in 1968 by which pair?", choices: ["Gordon Moore and Robert Noyce", "Steve Jobs and Steve Wozniak", "Larry Ellison and Bob Miner", "Andy Grove and Bill Gates"], correct: 0 },
  { question: "Moore's Law was first articulated by whom?", choices: ["Gordon Moore", "Robert Noyce", "Andy Grove", "Carver Mead"], correct: 0 },
  { question: "Oracle was co-founded by whom?", choices: ["Larry Ellison", "Larry Page", "Steve Ballmer", "Marc Benioff"], correct: 0 },
  { question: "Google was founded at which university?", choices: ["Stanford", "MIT", "Berkeley", "Caltech"], correct: 0 },
  { question: "Google was founded in which year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Facebook (now Meta) was founded by whom?", choices: ["Mark Zuckerberg", "Jack Dorsey", "Evan Spiegel", "Reid Hoffman"], correct: 0 },
  { question: "Twitter was co-founded in 2006 by Jack Dorsey, Biz Stone, Evan Williams, and whom?", choices: ["Noah Glass", "Reid Hoffman", "Kevin Systrom", "Brian Acton"], correct: 0 },
  { question: "LinkedIn was co-founded by whom?", choices: ["Reid Hoffman", "Mark Zuckerberg", "Jack Dorsey", "Marc Benioff"], correct: 0 },
  { question: "Yahoo! was co-founded by whom?", choices: ["Jerry Yang and David Filo", "Larry Page and Sergey Brin", "Pierre Omidyar and Jeff Skoll", "Marc Andreessen and Jim Clark"], correct: 0 },
  { question: "eBay was founded by whom?", choices: ["Pierre Omidyar", "Jeff Bezos", "Reid Hoffman", "Mark Cuban"], correct: 0 },
  { question: "Netscape was co-founded by whom?", choices: ["Marc Andreessen and Jim Clark", "Bill Gates and Paul Allen", "Larry Page and Sergey Brin", "Pierre Omidyar and Jeff Skoll"], correct: 0 },
  { question: "Sun Microsystems' name famously came from which university?", choices: ["Stanford University Network", "Santa Clara Sun Network", "San Jose Unix Net", "San Francisco University"], correct: 0 },
  { question: "PayPal was originally formed by the merger of Confinity and which company?", choices: ["X.com", "eBay", "Stripe", "Square"], correct: 0 },
  { question: "Which Apple product launched in 2007 and reshaped the smartphone market?", choices: ["iPhone", "iPod", "iPad", "Apple Watch"], correct: 0 },
  { question: "Tesla Motors was founded in 2003 by Martin Eberhard and whom?", choices: ["Marc Tarpenning", "Elon Musk", "JB Straubel", "Ian Wright"], correct: 0 },
  { question: "Nvidia, founded in 1993, is best known for what?", choices: ["Graphics processing units (GPUs)", "Disk drives", "Routers", "Word processors"], correct: 0 },
  { question: "Cisco Systems was founded at which university?", choices: ["Stanford", "MIT", "UCLA", "Harvard"], correct: 0 },
  { question: "Adobe was co-founded by whom?", choices: ["John Warnock and Charles Geschke", "Steve Jobs and Steve Wozniak", "Bill Gates and Paul Allen", "Larry Ellison and Bob Miner"], correct: 0 },
  { question: "Salesforce was founded in 1999 by whom?", choices: ["Marc Benioff", "Larry Ellison", "Reid Hoffman", "Aaron Levie"], correct: 0 },
  { question: "Y Combinator was founded in 2005 by Paul Graham, Jessica Livingston, and whom?", choices: ["Robert Morris and Trevor Blackwell", "Sam Altman and Sergey Brin", "Reid Hoffman and Peter Thiel", "Marc Andreessen and Ben Horowitz"], correct: 0 },
  { question: "Sand Hill Road in Menlo Park is famous for what?", choices: ["A high concentration of venture capital firms", "Semiconductor fabs", "Cloud data centers", "Hardware retail stores"], correct: 0 },
  { question: "Steve Jobs returned to Apple as CEO after Apple acquired which company?", choices: ["NeXT", "Pixar", "Be Inc.", "Claris"], correct: 0 },
  { question: "WhatsApp was co-founded by Jan Koum and whom?", choices: ["Brian Acton", "Reid Hoffman", "Evan Spiegel", "Kevin Systrom"], correct: 0 },
  { question: "Instagram was co-founded in 2010 by Kevin Systrom and whom?", choices: ["Mike Krieger", "Evan Spiegel", "Jack Dorsey", "Bobby Murphy"], correct: 0 },
  { question: "Snap Inc.'s Snapchat was co-founded by Evan Spiegel, Bobby Murphy, and whom?", choices: ["Reggie Brown", "Brian Acton", "Kevin Systrom", "Mike Krieger"], correct: 0 },
  { question: "Airbnb was co-founded by Brian Chesky, Joe Gebbia, and whom?", choices: ["Nathan Blecharczyk", "Travis Kalanick", "Garrett Camp", "Drew Houston"], correct: 0 },
  { question: "Uber was co-founded by Travis Kalanick and whom?", choices: ["Garrett Camp", "Brian Chesky", "Logan Green", "Drew Houston"], correct: 0 },
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
