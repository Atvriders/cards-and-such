import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SummerHitsQuizSettings { questions: "10" | "20" | "30"; }
export interface SummerHitsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SummerHitsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Surfin' USA' is by which band?", choices: ["The Beach Boys","Jan & Dean","The Ventures","The Drifters"], correct: 0 },
  { question: "'Summer of '69' is by?", choices: ["Bryan Adams","Bruce Springsteen","Tom Petty","Don Henley"], correct: 0 },
  { question: "'Cruel Summer' (1983) is by?", choices: ["Bananarama","Wham!","Madonna","Cyndi Lauper"], correct: 0 },
  { question: "'Despacito' was the song of which summer?", choices: ["2016","2017","2018","2019"], correct: 1 },
  { question: "'Hot in Herre' (2002) is by?", choices: ["Nelly","Ja Rule","Ludacris","50 Cent"], correct: 0 },
  { question: "'Summertime' (1991) by DJ Jazzy Jeff and?", choices: ["Will Smith / Fresh Prince","MC Hammer","Vanilla Ice","Tone Loc"], correct: 0 },
  { question: "'Get Lucky' (2013) is by?", choices: ["Daft Punk","Calvin Harris","Disclosure","David Guetta"], correct: 0 },
  { question: "'In the Summertime' (1970) is by?", choices: ["Mungo Jerry","Creedence","Three Dog Night","Tommy James"], correct: 0 },
  { question: "'California Gurls' (2010) features Snoop Dogg and?", choices: ["Katy Perry","Rihanna","Lady Gaga","Beyoncé"], correct: 0 },
  { question: "'Watermelon Sugar' is by?", choices: ["Harry Styles","Niall Horan","Liam Payne","Zayn"], correct: 0 },
  { question: "'Boys of Summer' (1984) is by?", choices: ["Don Henley","Phil Collins","Lionel Richie","Hall & Oates"], correct: 0 },
  { question: "'Hot Stuff' (1979) is by?", choices: ["Donna Summer","Diana Ross","Gloria Gaynor","Chic"], correct: 0 },
  { question: "'Levitating' (2020) is by?", choices: ["Dua Lipa","Doja Cat","Olivia Rodrigo","Ariana Grande"], correct: 0 },
  { question: "'Old Town Road' was the summer of?", choices: ["2018","2019","2020","2021"], correct: 1 },
  { question: "'Blurred Lines' (2013) is by?", choices: ["Robin Thicke","Justin Timberlake","Bruno Mars","Pharrell"], correct: 0 },
  { question: "'Call Me Maybe' (2012) is by?", choices: ["Carly Rae Jepsen","Katy Perry","Selena Gomez","Demi Lovato"], correct: 0 },
  { question: "'Macarena' was the song of?", choices: ["1995","1996","1997","1998"], correct: 1 },
  { question: "'Shape of You' (2017) is by?", choices: ["Ed Sheeran","Sam Smith","James Arthur","Charlie Puth"], correct: 0 },
  { question: "'Uptown Funk' (2014) is by Mark Ronson and?", choices: ["Bruno Mars","Cee-Lo","Pharrell","Adam Levine"], correct: 0 },
  { question: "'Cheerleader' (Felix Jaehn remix, 2014/15) is by?", choices: ["OMI","Magic!","Major Lazer","MØ"], correct: 0 },
  { question: "\"I Gotta Feeling\" (2009) is by?", choices: ["Black Eyed Peas","LMFAO","Pitbull","Flo Rida"], correct: 0 },
  { question: "\"Party in the U.S.A.\" is by?", choices: ["Miley Cyrus","Katy Perry","Hilary Duff","Selena Gomez"], correct: 0 },
  { question: "\"Cheap Thrills\" (2016) is by?", choices: ["Sia","Rihanna","Calvin Harris","Zara Larsson"], correct: 0 },
  { question: "\"Senorita\" (2019) is by Shawn Mendes and?", choices: ["Camila Cabello","Selena Gomez","Halsey","Dua Lipa"], correct: 0 },
  { question: "\"Havana\" (2017) is by?", choices: ["Camila Cabello","Becky G","Demi Lovato","Selena Gomez"], correct: 0 },
  { question: "\"Cheerleader\" original was released by OMI in?", choices: ["2012","2014","2015","2016"], correct: 0 },
  { question: "\"Bad Romance\" topped charts in which summer?", choices: ["2008","2009","2010","2011"], correct: 1 },
  { question: "\"As It Was\" by Harry Styles dominated summer of?", choices: ["2021","2022","2023","2024"], correct: 1 },
  { question: "\"One Kiss\" (2018) is by Calvin Harris and?", choices: ["Dua Lipa","Rihanna","Ellie Goulding","Sam Smith"], correct: 0 },
  { question: "\"I Like It\" (2018) is by Cardi B, Bad Bunny and?", choices: ["J Balvin","Maluma","Daddy Yankee","Ozuna"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SummerHitsQuizSettings): SummerHitsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SummerHitsQuizState, action: SummerHitsQuizAction): SummerHitsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SummerHitsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
