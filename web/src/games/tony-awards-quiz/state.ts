import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TonyAwardsQuizSettings { questions: "10" | "20"; }
export interface TonyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TonyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tony Awards were established in?",
    "choices": [
      "1945",
      "1947",
      "1949",
      "1951"
    ],
    "correct": 1
  },
  {
    "question": "Tonys honor excellence in?",
    "choices": [
      "Film",
      "Television",
      "Broadway theatre",
      "Off-Broadway"
    ],
    "correct": 2
  },
  {
    "question": "Tonys are named after?",
    "choices": [
      "Tony Bennett",
      "Antoinette Perry",
      "Anthony Quinn",
      "Tony Curtis"
    ],
    "correct": 1
  },
  {
    "question": "Antoinette Perry was a?",
    "choices": [
      "Actress and director",
      "Producer only",
      "Critic",
      "Choreographer"
    ],
    "correct": 0
  },
  {
    "question": "Tony Awards venue most associated in 21st century?",
    "choices": [
      "Carnegie Hall",
      "Radio City Music Hall",
      "Lincoln Center",
      "Madison Square Garden"
    ],
    "correct": 1
  },
  {
    "question": "Most Tony Awards won by a single show (record)?",
    "choices": [
      "10",
      "12",
      "13",
      "14"
    ],
    "correct": 1
  },
  {
    "question": "Show with 12 Tonys (1968 record)?",
    "choices": [
      "Hello, Dolly!",
      "Cabaret",
      "1776",
      "Fiddler"
    ],
    "correct": 0
  },
  {
    "question": "Show that tied 12-Tony record in 2016?",
    "choices": [
      "Book of Mormon",
      "Hamilton",
      "The Producers",
      "Wicked"
    ],
    "correct": 1
  },
  {
    "question": "The Producers (2001) won how many Tonys?",
    "choices": [
      "10",
      "11",
      "12",
      "13"
    ],
    "correct": 2
  },
  {
    "question": "Hamilton was created by?",
    "choices": [
      "Stephen Schwartz",
      "Lin-Manuel Miranda",
      "Andrew Lloyd Webber",
      "Stephen Sondheim"
    ],
    "correct": 1
  },
  {
    "question": "Stephen Sondheim's Tony for Best Score for Sweeney Todd was in?",
    "choices": [
      "1977",
      "1979",
      "1981",
      "1983"
    ],
    "correct": 1
  },
  {
    "question": "Best Musical 1976?",
    "choices": [
      "A Chorus Line",
      "Chicago",
      "Pacific Overtures",
      "Bubbling Brown Sugar"
    ],
    "correct": 0
  },
  {
    "question": "Best Musical 1988?",
    "choices": [
      "Phantom of the Opera",
      "Into the Woods",
      "Les Miserables",
      "Sarafina!"
    ],
    "correct": 0
  },
  {
    "question": "Best Musical 2003?",
    "choices": [
      "Hairspray",
      "Movin' Out",
      "Urinetown",
      "Amour"
    ],
    "correct": 0
  },
  {
    "question": "Best Play 1949 (first Tony for Best Play category)?",
    "choices": [
      "Mister Roberts",
      "Death of a Salesman",
      "Streetcar",
      "Tea and Sympathy"
    ],
    "correct": 1
  },
  {
    "question": "Death of a Salesman won Best Play in?",
    "choices": [
      "1947",
      "1949",
      "1951",
      "1953"
    ],
    "correct": 1
  },
  {
    "question": "Most Tony nominations for an actor (record holder)?",
    "choices": [
      "Julie Harris",
      "Audra McDonald",
      "Bernadette Peters",
      "Chita Rivera"
    ],
    "correct": 1
  },
  {
    "question": "Audra McDonald's Tony win count?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correct": 2
  },
  {
    "question": "Best Musical 2016 winner?",
    "choices": [
      "Hamilton",
      "Waitress",
      "School of Rock",
      "Bright Star"
    ],
    "correct": 0
  },
  {
    "question": "Best Musical 2018?",
    "choices": [
      "Mean Girls",
      "Frozen",
      "The Band's Visit",
      "SpongeBob"
    ],
    "correct": 2
  },
  {
    "question": "Best Musical 2022?",
    "choices": [
      "MJ",
      "Six",
      "A Strange Loop",
      "Paradise Square"
    ],
    "correct": 2
  },
  {
    "question": "Best Musical 2023?",
    "choices": [
      "Some Like It Hot",
      "Kimberly Akimbo",
      "Shucked",
      "New York, New York"
    ],
    "correct": 1
  },
  {
    "question": "Best Musical 2024?",
    "choices": [
      "Hell's Kitchen",
      "Suffs",
      "The Outsiders",
      "Illinoise"
    ],
    "correct": 2
  },
  {
    "question": "Best Play 2023?",
    "choices": [
      "Leopoldstadt",
      "Cost of Living",
      "Ain't No Mo'",
      "Between Riverside and Crazy"
    ],
    "correct": 0
  },
  {
    "question": "Andrew Lloyd Webber's Cats won Best Musical in?",
    "choices": [
      "1981",
      "1983",
      "1985",
      "1987"
    ],
    "correct": 1
  },
  {
    "question": "Les Miserables won Best Musical in?",
    "choices": [
      "1985",
      "1986",
      "1987",
      "1988"
    ],
    "correct": 2
  },
  {
    "question": "West Side Story (original 1957) Best Musical?",
    "choices": [
      "Yes",
      "No",
      "It was nominated",
      "It was Best Play"
    ],
    "correct": 1
  },
  {
    "question": "Tony for Best Revival of a Musical first awarded in?",
    "choices": [
      "1977",
      "1994",
      "1980",
      "1989"
    ],
    "correct": 1
  },
  {
    "question": "Lifetime achievement Tony is called?",
    "choices": [
      "Special Tony",
      "Honorary Tony",
      "Isabelle Stevenson",
      "Both 1 & 3"
    ],
    "correct": 3
  },
  {
    "question": "Tony Awards are presented by?",
    "choices": [
      "Broadway League and ATW",
      "Equity",
      "SAG",
      "ACE"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TonyAwardsQuizSettings): TonyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TonyAwardsQuizState, action: TonyAwardsQuizAction): TonyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TonyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
