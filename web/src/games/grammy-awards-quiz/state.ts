import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GrammyAwardsQuizSettings { questions: "10" | "20" | "30"; }
export interface GrammyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GrammyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The first Grammy Awards ceremony was held in what year?", choices: ["1955","1959","1962","1968"], correct: 1 },
  { question: "Who has won the most Grammys of all time?", choices: ["Stevie Wonder","Beyoncé","Quincy Jones","Alison Krauss"], correct: 1 },
  { question: "Album of the Year 2010 went to whom?", choices: ["Beyoncé","Taylor Swift","Lady Gaga","Black Eyed Peas"], correct: 1 },
  { question: "Adele's '21' won Album of the Year in?", choices: ["2010","2011","2012","2013"], correct: 2 },
  { question: "Which artist won Record of the Year for 'Rolling in the Deep'?", choices: ["Adele","Beyoncé","Taylor Swift","Bruno Mars"], correct: 0 },
  { question: "Best New Artist 2021 was?", choices: ["Megan Thee Stallion","Phoebe Bridgers","Doja Cat","Chika"], correct: 0 },
  { question: "The Grammy is shaped like which object?", choices: ["A microphone","A gramophone","A trophy cup","A guitar"], correct: 1 },
  { question: "Stevie Wonder won Album of the Year three times in which decade?", choices: ["1960s","1970s","1980s","1990s"], correct: 1 },
  { question: "Who won Album of the Year 2016 with '1989'?", choices: ["Adele","Taylor Swift","Kendrick Lamar","Beyoncé"], correct: 1 },
  { question: "Kendrick Lamar's 'DAMN.' famously won which award?", choices: ["Album of the Year","Pulitzer Prize","Mercury Prize","BRIT Album"], correct: 1 },
  { question: "Which artist swept all four major categories in 1981?", choices: ["Christopher Cross","Lionel Richie","Toto","Phil Collins"], correct: 0 },
  { question: "Album of the Year 2024 went to which artist?", choices: ["Taylor Swift","SZA","Olivia Rodrigo","Miley Cyrus"], correct: 0 },
  { question: "Who broke the record for most-nominated artist of all time?", choices: ["Quincy Jones","Jay-Z","Beyoncé","Paul McCartney"], correct: 1 },
  { question: "The Grammys are presented by which organization?", choices: ["RIAA","Recording Academy","BMI","ASCAP"], correct: 1 },
  { question: "Michael Jackson swept how many Grammys in 1984?", choices: ["6","7","8","10"], correct: 2 },
  { question: "Which song won Song of the Year 2020 ('Bad Guy')?", choices: ["Bad Guy","Old Town Road","Truth Hurts","Lover"], correct: 0 },
  { question: "Billie Eilish at 18 became the youngest to win Album of the Year — for which album?", choices: ["Don't Smile at Me","When We All Fall Asleep, Where Do We Go?","Happier Than Ever","Hit Me Hard and Soft"], correct: 1 },
  { question: "How many gramophones do statuettes have in a Grammy?", choices: ["1","2","3","12"], correct: 0 },
  { question: "Which jazz icon won 8 Grammys in a single year (1991)?", choices: ["Wynton Marsalis","Quincy Jones","Branford Marsalis","Bobby McFerrin"], correct: 1 },
  { question: "U2 won Album of the Year in 2006 for?", choices: ["Achtung Baby","All That You Can't Leave Behind","How to Dismantle an Atomic Bomb","No Line on the Horizon"], correct: 2 },
  { question: "Beyoncé broke the record for most Grammy wins ever in which year?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Who won the first Grammy for Album of the Year (1959)?", choices: ["Frank Sinatra","Henry Mancini","Ella Fitzgerald","Bobby Darin"], correct: 1 },
  { question: "\"Bad Guy\" by Billie Eilish won Record of the Year in?", choices: ["2019","2020","2021","2022"], correct: 1 },
  { question: "Bruno Mars and Anderson .Paak won Album of the Year 2022 as which group?", choices: ["Silk Sonic","Black Pumas","LSD","Magic!"], correct: 0 },
  { question: "Which Grammy ceremony had Jennifer Lopez's green Versace dress moment?", choices: ["1999","2000","2001","2002"], correct: 1 },
  { question: "Harry Styles won Album of the Year 2023 for which album?", choices: ["Fine Line","Harry's House","Harry Styles","As It Was"], correct: 1 },
  { question: "Hip-hop's first Album of the Year went to which artist (1999)?", choices: ["Lauryn Hill","OutKast","Kanye West","Eminem"], correct: 0 },
  { question: "Which producer won Producer of the Year a record number of times?", choices: ["Quincy Jones","Babyface","Rick Rubin","Pharrell"], correct: 1 },
  { question: "Taylor Swift became the first artist to win Album of the Year how many times?", choices: ["2","3","4","5"], correct: 2 },
  { question: "\"Uptown Funk\" by Mark Ronson ft. Bruno Mars won Record of the Year in?", choices: ["2015","2016","2017","2018"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GrammyAwardsQuizSettings): GrammyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GrammyAwardsQuizState, action: GrammyAwardsQuizAction): GrammyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GrammyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
