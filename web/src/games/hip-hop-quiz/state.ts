import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HipHopQuizSettings { questions: "10" | "20" | "30"; }
export interface HipHopQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HipHopQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What city is the birthplace of hip-hop?", choices: ["The Bronx, New York","Compton","Atlanta","Detroit"], correct: 0 },
  { question: "In what year did hip-hop begin (commonly cited)?", choices: ["1973","1965","1980","1968"], correct: 0 },
  { question: "Who is regarded as the father of hip-hop?", choices: ["DJ Kool Herc","Grandmaster Flash","Afrika Bambaataa","Russell Simmons"], correct: 0 },
  { question: "What 1979 song is often the first commercially successful rap?", choices: ["Rapper's Delight","The Message","Walk This Way","Fight the Power"], correct: 0 },
  { question: "Who recorded Rapper's Delight?", choices: ["The Sugarhill Gang","Grandmaster Flash","Run-DMC","Kurtis Blow"], correct: 0 },
  { question: "What 1982 Grandmaster Flash song addressed urban life?", choices: ["The Message","White Lines","Adventures on the Wheels","Freedom"], correct: 0 },
  { question: "Who collaborated with Aerosmith on 1986's Walk This Way?", choices: ["Run-DMC","Beastie Boys","LL Cool J","Public Enemy"], correct: 0 },
  { question: "Who released the album Straight Outta Compton (1988)?", choices: ["N.W.A","Ice-T","2 Live Crew","Geto Boys"], correct: 0 },
  { question: "Who was Tupac Shakur known for?", choices: ["West Coast rap","Activism in lyrics","Both","All Eyez on Me"], correct: 2 },
  { question: "In what year was Tupac killed?", choices: ["1996","1994","1998","2000"], correct: 0 },
  { question: "Who was The Notorious B.I.G.?", choices: ["East Coast rapper Christopher Wallace","Brooklyn-born icon","Both","Just NY"], correct: 2 },
  { question: "In what year was Biggie killed?", choices: ["1997","1996","1998","1995"], correct: 0 },
  { question: "Who founded Bad Boy Records?", choices: ["Sean Combs (Puff Daddy/Diddy)","Suge Knight","Russell Simmons","Jay-Z"], correct: 0 },
  { question: "Who founded Death Row Records?", choices: ["Suge Knight, Dr. Dre","Diddy","Russell Simmons","Jay-Z"], correct: 0 },
  { question: "What rapper founded Roc-A-Fella Records?", choices: ["Jay-Z","Damon Dash","Both","Kareem Burke too"], correct: 0 },
  { question: "Whose 2003 album was The Black Album?", choices: ["Jay-Z","Kanye West","Eminem","50 Cent"], correct: 0 },
  { question: "Who's Eminem's mentor?", choices: ["Dr. Dre","Snoop Dogg","Ice Cube","DJ Yella"], correct: 0 },
  { question: "What 2002 movie starred Eminem?", choices: ["8 Mile","Get Rich or Die Tryin","Notorious","Straight Outta Compton"], correct: 0 },
  { question: "Who released The College Dropout in 2004?", choices: ["Kanye West","Lupe Fiasco","Common","Talib Kweli"], correct: 0 },
  { question: "What hip-hop group included Q-Tip and Phife Dawg?", choices: ["A Tribe Called Quest","De La Soul","Roots","Black Star"], correct: 0 },
  { question: "Who released Illmatic (1994)?", choices: ["Nas","AZ","Mobb Deep","Wu-Tang Clan"], correct: 0 },
  { question: "What hip-hop collective featured RZA and Method Man?", choices: ["Wu-Tang Clan","D12","Cash Money","Boot Camp Clik"], correct: 0 },
  { question: "Who recorded To Pimp a Butterfly (2015)?", choices: ["Kendrick Lamar","J. Cole","Drake","Childish Gambino"], correct: 0 },
  { question: "Who is Drake's hometown?", choices: ["Toronto","Atlanta","Houston","Memphis"], correct: 0 },
  { question: "What 2017 album did Cardi B release?", choices: ["Invasion of Privacy (2018)","Bodak Yellow single 2017","Both","Just singles 2017"], correct: 2 },
  { question: "What is freestyle in hip-hop?", choices: ["Improvised rapping","Written verses","Slow flow","Trap"], correct: 0 },
  { question: "What is sampling?", choices: ["Using audio from existing recordings","Recording fresh","Live performance","Mastering"], correct: 0 },
  { question: "What region birthed crunk music?", choices: ["Atlanta and the South","NY","LA","Detroit"], correct: 0 },
  { question: "Who is Lil Wayne's mentor and label boss?", choices: ["Birdman / Cash Money","Diddy","Dr. Dre","Jay-Z"], correct: 0 },
  { question: "Who is OutKast?", choices: ["Andre 3000 and Big Boi","Dre and Snoop","Jay and Diddy","Wu-Tang"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HipHopQuizSettings): HipHopQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HipHopQuizState, action: HipHopQuizAction): HipHopQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HipHopQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
