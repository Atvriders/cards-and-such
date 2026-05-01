import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NetflixHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface NetflixHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NetflixHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Netflix was founded in what year?", choices: ["1995","1997","1999","2001"], correct: 1 },
  { question: "Who co-founded Netflix with Reed Hastings?", choices: ["Marc Randolph","Ted Sarandos","Greg Peters","Jeff Bewkes"], correct: 0 },
  { question: "Netflix originally rented what physical media by mail?", choices: ["VHS tapes","DVDs","Blu-rays","CDs"], correct: 1 },
  { question: "In what year did Netflix launch streaming?", choices: ["2005","2007","2009","2011"], correct: 1 },
  { question: "Which was Netflix's first original scripted series?", choices: ["House of Cards","Lilyhammer","Orange Is the New Black","Hemlock Grove"], correct: 1 },
  { question: "Stranger Things first premiered in what year?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Netflix expanded streaming to ~190 countries in what year?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Squid Game premiered globally on Netflix in what year?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "Reed Hastings stepped down as co-CEO in what year?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Where is Netflix headquartered?", choices: ["Los Gatos, CA","Mountain View, CA","Cupertino, CA","San Francisco, CA"], correct: 0 },
  { question: "Netflix's ad-supported tier launched in what year?", choices: ["2021","2022","2023","2024"], correct: 1 },
  { question: "How much did the Netflix Prize award for the winning algorithm?", choices: ["$500,000","$1 million","$2 million","$5 million"], correct: 1 },
  { question: "Who is Netflix's longtime Chief Content Officer?", choices: ["Ted Sarandos","Bela Bajaria","Greg Peters","Cindy Holland"], correct: 0 },
  { question: "Roma was Netflix's first film nominated for which Academy Award?", choices: ["Best Picture","Best Director","Best Original Screenplay","Best Cinematography"], correct: 0 },
  { question: "What is Netflix's audio-logo soundbite called?", choices: ["Tudum","Boom","Ping","Ka-chunk"], correct: 0 },
  { question: "Which Korean drama became Netflix's most-watched series ever?", choices: ["Kingdom","Squid Game","Sweet Home","All of Us Are Dead"], correct: 1 },
  { question: "Netflix went public (IPO) in what year?", choices: ["2002","2004","2006","2008"], correct: 0 },
  { question: "What was Netflix's original mail envelope color?", choices: ["Red","Blue","Black","White"], correct: 0 },
  { question: "Which company did Netflix nearly sell itself to in 2000?", choices: ["Amazon","Blockbuster","Best Buy","Walmart"], correct: 1 },
  { question: "The Witcher, starring Henry Cavill, debuted in what year?", choices: ["2017","2018","2019","2020"], correct: 2 },
  { question: "Which animated film won Netflix its first Best Animated Feature Oscar?", choices: ["Klaus","Guillermo del Toro's Pinocchio","The Mitchells vs. The Machines","Sea Beast"], correct: 1 },
  { question: "Which Netflix talk show featured David Letterman after his retirement?", choices: ["My Next Guest Needs No Introduction","Comedians in Cars","Patriot Act","Norm Macdonald Has a Show"], correct: 0 },
  { question: "What year did Netflix launch its 'Skip Intro' button?", choices: ["2015","2017","2019","2021"], correct: 1 },
  { question: "Bridgerton, a Netflix Shondaland show, premiered in what year?", choices: ["2018","2019","2020","2021"], correct: 2 },
  { question: "Approximately how many global subscribers did Netflix surpass in 2024?", choices: ["100 million","200 million","300 million","500 million"], correct: 1 },
  { question: "Which Martin Scorsese film was a major Netflix release in 2019?", choices: ["The Irishman","Silence","Killers of the Flower Moon","Hugo"], correct: 0 },
  { question: "Netflix's interactive special with Bandersnatch came from which series?", choices: ["Black Mirror","Stranger Things","Love, Death & Robots","Dark"], correct: 0 },
  { question: "Which Netflix reality dating show debuted in 2020?", choices: ["Too Hot to Handle","Love Is Blind","The Ultimatum","Perfect Match"], correct: 1 },
  { question: "The Crown, a Netflix drama, focuses on which monarch?", choices: ["Queen Victoria","Queen Elizabeth II","King George VI","King Charles III"], correct: 1 },
  { question: "Which Netflix anime adaptation released in 2024 starred a live-action cast?", choices: ["Cowboy Bebop","One Piece","Avatar: The Last Airbender","Death Note"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NetflixHistoryQuizSettings): NetflixHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NetflixHistoryQuizState, action: NetflixHistoryQuizAction): NetflixHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NetflixHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
