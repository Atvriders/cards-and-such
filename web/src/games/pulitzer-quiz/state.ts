import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PulitzerQuizSettings { questions: "10" | "20"; }
export interface PulitzerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PulitzerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Pulitzer Prize is administered by which university?",
    "choices": [
      "Harvard",
      "Yale",
      "Columbia",
      "Princeton"
    ],
    "correct": 2
  },
  {
    "question": "First Pulitzer Prizes were awarded in?",
    "choices": [
      "1903",
      "1917",
      "1925",
      "1933"
    ],
    "correct": 1
  },
  {
    "question": "Joseph Pulitzer was publisher of?",
    "choices": [
      "NY Times",
      "NY World",
      "NY Herald",
      "NY Sun"
    ],
    "correct": 1
  },
  {
    "question": "Pulitzer's bequest also founded which journalism school?",
    "choices": [
      "Northwestern",
      "Columbia",
      "NYU",
      "UCLA"
    ],
    "correct": 1
  },
  {
    "question": "Pulitzer Prize for Fiction was originally called?",
    "choices": [
      "Prize for Fiction",
      "Prize for the Novel",
      "Prize for Romance",
      "Prize for Story"
    ],
    "correct": 1
  },
  {
    "question": "First Fiction (Novel) Pulitzer (1918) winner?",
    "choices": [
      "His Family",
      "The Magnificent Ambersons",
      "The Age of Innocence",
      "Main Street"
    ],
    "correct": 0
  },
  {
    "question": "Edith Wharton won Fiction Pulitzer for?",
    "choices": [
      "The House of Mirth",
      "The Age of Innocence",
      "Ethan Frome",
      "The Custom of the Country"
    ],
    "correct": 1
  },
  {
    "question": "Gone with the Wind won the Fiction Pulitzer in?",
    "choices": [
      "1935",
      "1937",
      "1939",
      "1941"
    ],
    "correct": 1
  },
  {
    "question": "Author of 1937 Fiction Pulitzer Gone with the Wind?",
    "choices": [
      "Pearl Buck",
      "Margaret Mitchell",
      "Willa Cather",
      "Edna Ferber"
    ],
    "correct": 1
  },
  {
    "question": "To Kill a Mockingbird won Fiction Pulitzer in?",
    "choices": [
      "1961",
      "1963",
      "1965",
      "1967"
    ],
    "correct": 0
  },
  {
    "question": "The Old Man and the Sea won Fiction Pulitzer in?",
    "choices": [
      "1950",
      "1953",
      "1955",
      "1958"
    ],
    "correct": 1
  },
  {
    "question": "A Confederacy of Dunces won (posthumously) in?",
    "choices": [
      "1979",
      "1981",
      "1983",
      "1985"
    ],
    "correct": 1
  },
  {
    "question": "Beloved (Toni Morrison) won Fiction Pulitzer in?",
    "choices": [
      "1986",
      "1988",
      "1990",
      "1992"
    ],
    "correct": 1
  },
  {
    "question": "The Road by Cormac McCarthy won in?",
    "choices": [
      "2005",
      "2007",
      "2009",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "A Visit from the Goon Squad won in?",
    "choices": [
      "2009",
      "2011",
      "2013",
      "2015"
    ],
    "correct": 1
  },
  {
    "question": "The Goldfinch won the Fiction Pulitzer in?",
    "choices": [
      "2012",
      "2013",
      "2014",
      "2015"
    ],
    "correct": 2
  },
  {
    "question": "All the Light We Cannot See won in?",
    "choices": [
      "2014",
      "2015",
      "2016",
      "2017"
    ],
    "correct": 1
  },
  {
    "question": "The Underground Railroad won in?",
    "choices": [
      "2016",
      "2017",
      "2018",
      "2019"
    ],
    "correct": 1
  },
  {
    "question": "Less by Andrew Sean Greer won in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "The Overstory (Powers) won in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "Trust by Hernan Diaz won in?",
    "choices": [
      "2021",
      "2022",
      "2023",
      "2024"
    ],
    "correct": 2
  },
  {
    "question": "Drama Pulitzer 1949 (Death of a Salesman) author?",
    "choices": [
      "Tennessee Williams",
      "Eugene O'Neill",
      "Arthur Miller",
      "William Inge"
    ],
    "correct": 2
  },
  {
    "question": "Hamilton won the Pulitzer for Drama in?",
    "choices": [
      "2014",
      "2015",
      "2016",
      "2017"
    ],
    "correct": 1
  },
  {
    "question": "Number of Pulitzer journalism categories (approx)?",
    "choices": [
      "7",
      "10",
      "14",
      "21"
    ],
    "correct": 2
  },
  {
    "question": "Public Service Pulitzer recognizes work by a?",
    "choices": [
      "Reporter",
      "Newspaper/Org",
      "Editor",
      "Photographer"
    ],
    "correct": 1
  },
  {
    "question": "Public Service medal was designed by?",
    "choices": [
      "Daniel Chester French",
      "Saint-Gaudens",
      "Gutzon Borglum",
      "Frederic Remington"
    ],
    "correct": 0
  },
  {
    "question": "Pulitzer Prize for Music was first awarded in?",
    "choices": [
      "1923",
      "1933",
      "1943",
      "1953"
    ],
    "correct": 2
  },
  {
    "question": "First Music Pulitzer winner?",
    "choices": [
      "Aaron Copland",
      "William Schuman",
      "Charles Ives",
      "Samuel Barber"
    ],
    "correct": 1
  },
  {
    "question": "Kendrick Lamar won the Music Pulitzer for?",
    "choices": [
      "DAMN.",
      "To Pimp a Butterfly",
      "Mr. Morale",
      "good kid"
    ],
    "correct": 0
  },
  {
    "question": "Pulitzers are announced annually in which month?",
    "choices": [
      "March",
      "April",
      "May",
      "June"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PulitzerQuizSettings): PulitzerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PulitzerQuizState, action: PulitzerQuizAction): PulitzerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PulitzerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
