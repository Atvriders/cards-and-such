import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InternetHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface InternetHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InternetHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "ARPANET was the predecessor to what?", choices: ["The telephone","The Internet","Email only","The Web"], correct: 1 },
  { question: "ARPANET sent its first message in what year?", choices: ["1967","1969","1971","1973"], correct: 1 },
  { question: "TCP/IP was officially adopted by ARPANET on what date?", choices: ["Jan 1, 1981","Jan 1, 1983","Jan 1, 1985","Jan 1, 1990"], correct: 1 },
  { question: "Who is credited as a co-inventor of TCP/IP?", choices: ["Vint Cerf","Tim Berners-Lee","Marc Andreessen","Larry Roberts"], correct: 0 },
  { question: "Vint Cerf's TCP/IP co-inventor is?", choices: ["Bob Kahn","Jon Postel","Steve Crocker","Paul Mockapetris"], correct: 0 },
  { question: "Who invented the World Wide Web?", choices: ["Tim Berners-Lee","Marc Andreessen","Vint Cerf","Robert Cailliau"], correct: 0 },
  { question: "The World Wide Web was invented at?", choices: ["MIT","CERN","DARPA","Bell Labs"], correct: 1 },
  { question: "The first website went live in what year?", choices: ["1989","1991","1993","1995"], correct: 1 },
  { question: "Mosaic, an early graphical browser, was released in?", choices: ["1991","1993","1995","1997"], correct: 1 },
  { question: "Who co-authored Mosaic and later co-founded Netscape?", choices: ["Marc Andreessen","Jim Clark","Bill Joy","Tim O'Reilly"], correct: 0 },
  { question: "Netscape Navigator launched in?", choices: ["1993","1994","1996","1998"], correct: 1 },
  { question: "The DNS (Domain Name System) was designed by?", choices: ["Paul Mockapetris","Jon Postel","Vint Cerf","Bob Kahn"], correct: 0 },
  { question: "DNS was introduced in what year?", choices: ["1981","1983","1985","1987"], correct: 1 },
  { question: "Email's '@' sign was popularized for routing by?", choices: ["Ray Tomlinson","Vint Cerf","Tim Berners-Lee","Paul Mockapetris"], correct: 0 },
  { question: "The first commercial dial-up ISP in the U.S. was widely considered to be?", choices: ["AOL","CompuServe","The World","Prodigy"], correct: 2 },
  { question: "HTTP/1.0 was published as RFC 1945 in?", choices: ["1994","1996","1998","2000"], correct: 1 },
  { question: "HTML was originally based on which markup metalanguage?", choices: ["XML","SGML","LaTeX","RTF"], correct: 1 },
  { question: "Google was founded in what year?", choices: ["1996","1998","2000","2002"], correct: 1 },
  { question: "Google's founders are Larry Page and?", choices: ["Sergey Brin","Eric Schmidt","Sundar Pichai","Marissa Mayer"], correct: 0 },
  { question: "Yahoo! was founded in what year?", choices: ["1993","1994","1996","1998"], correct: 1 },
  { question: "Amazon was founded in what year?", choices: ["1993","1994","1996","1998"], correct: 1 },
  { question: "eBay was founded in what year?", choices: ["1993","1995","1997","1999"], correct: 1 },
  { question: "The first dot-com era ended with a market crash in approximately?", choices: ["1998","2000","2002","2004"], correct: 1 },
  { question: "Wi-Fi (IEEE 802.11) was first ratified in?", choices: ["1995","1997","1999","2001"], correct: 1 },
  { question: "IPv6 was developed primarily to solve?", choices: ["Encryption","IPv4 address exhaustion","Routing speed","Wi-Fi range"], correct: 1 },
  { question: "Wikipedia was launched in what year?", choices: ["1999","2001","2003","2005"], correct: 1 },
  { question: "Facebook was launched in what year?", choices: ["2002","2004","2006","2008"], correct: 1 },
  { question: "YouTube was founded in what year?", choices: ["2003","2005","2007","2009"], correct: 1 },
  { question: "Twitter (now X) was launched in what year?", choices: ["2004","2006","2008","2010"], correct: 1 },
  { question: "The Internet Engineering Task Force (IETF) publishes standards as?", choices: ["ISOs","RFCs","ITU specs","ANSI docs"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InternetHistoryQuizSettings): InternetHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InternetHistoryQuizState, action: InternetHistoryQuizAction): InternetHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InternetHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
