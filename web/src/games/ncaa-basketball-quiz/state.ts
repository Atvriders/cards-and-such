import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NcaaBasketballQuizSettings { questions: "10" | "20" | "30"; }
export interface NcaaBasketballQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NcaaBasketballQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which school has the most NCAA men's basketball titles?",
    "choices": [
      "Duke",
      "Kentucky",
      "UCLA",
      "North Carolina"
    ],
    "correct": 2
  },
  {
    "question": "Who coached UCLA to 10 NCAA men's titles?",
    "choices": [
      "Wooden",
      "Krzyzewski",
      "Knight",
      "Smith"
    ],
    "correct": 0
  },
  {
    "question": "What is the NCAA tournament also known as?",
    "choices": [
      "The Big Dance",
      "The Final Push",
      "The Hoop Run",
      "March Mayhem"
    ],
    "correct": 0
  },
  {
    "question": "How many teams are in the men's NCAA tournament?",
    "choices": [
      "64",
      "65",
      "68",
      "72"
    ],
    "correct": 2
  },
  {
    "question": "Who won the 2024 men's NCAA championship?",
    "choices": [
      "UConn",
      "Purdue",
      "Alabama",
      "NC State"
    ],
    "correct": 0
  },
  {
    "question": "Coach K led which team for decades?",
    "choices": [
      "UNC",
      "Duke",
      "Kentucky",
      "Kansas"
    ],
    "correct": 1
  },
  {
    "question": "Who hit 'The Shot' for Duke vs Kentucky in 1992?",
    "choices": [
      "Laettner",
      "Hill",
      "Hurley",
      "Davis"
    ],
    "correct": 0
  },
  {
    "question": "Which team is called the Tar Heels?",
    "choices": [
      "Duke",
      "UNC",
      "NC State",
      "Wake Forest"
    ],
    "correct": 1
  },
  {
    "question": "Where is NCAA HQ located?",
    "choices": [
      "Atlanta",
      "Indianapolis",
      "New York",
      "New Orleans"
    ],
    "correct": 1
  },
  {
    "question": "Who is the all-time NCAA D-I men's scoring leader?",
    "choices": [
      "Pete Maravich",
      "Caitlin Clark",
      "Kareem Abdul-Jabbar",
      "Oscar Robertson"
    ],
    "correct": 0
  },
  {
    "question": "Which conference does Kentucky play in?",
    "choices": [
      "ACC",
      "Big Ten",
      "SEC",
      "Big 12"
    ],
    "correct": 2
  },
  {
    "question": "Who won the 2023 men's NCAA title?",
    "choices": [
      "UConn",
      "San Diego State",
      "Miami",
      "FAU"
    ],
    "correct": 0
  },
  {
    "question": "Which 16-seed beat Virginia in 2018?",
    "choices": [
      "UMBC",
      "FGCU",
      "St. Peter's",
      "Lehigh"
    ],
    "correct": 0
  },
  {
    "question": "How many NCAA titles does Coach K have?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Caitlin Clark played college ball for which school?",
    "choices": [
      "Iowa",
      "UConn",
      "South Carolina",
      "Stanford"
    ],
    "correct": 0
  },
  {
    "question": "Which team won three straight men's titles 1971-73?",
    "choices": [
      "UCLA",
      "Indiana",
      "Kentucky",
      "UNC"
    ],
    "correct": 0
  },
  {
    "question": "Who coached Indiana to the 1976 undefeated title?",
    "choices": [
      "Bob Knight",
      "Bobby Hurley",
      "John Calipari",
      "Mike K"
    ],
    "correct": 0
  },
  {
    "question": "Which school is nicknamed the Jayhawks?",
    "choices": [
      "Kansas",
      "Kansas State",
      "Iowa",
      "Iowa State"
    ],
    "correct": 0
  },
  {
    "question": "Who hit the dunk for NC State to win the 1983 title?",
    "choices": [
      "Lorenzo Charles",
      "Jim Valvano",
      "Sidney Lowe",
      "Dereck Whittenburg"
    ],
    "correct": 0
  },
  {
    "question": "How many wins on Kareem's college team UCLA in his career?",
    "choices": [
      "88",
      "78",
      "98",
      "108"
    ],
    "correct": 0
  },
  {
    "question": "Whose record did Caitlin Clark surpass for D-I scoring in 2024?",
    "choices": [
      "Pete Maravich",
      "Lisa Leslie",
      "Kelsey Plum",
      "Patrick Ewing"
    ],
    "correct": 0
  },
  {
    "question": "What is the NIT?",
    "choices": [
      "A postseason tournament",
      "Preseason event",
      "Coaches award",
      "Recruiting fair"
    ],
    "correct": 0
  },
  {
    "question": "Who went 4-for-4 in NCAA championship games as a player at UCLA?",
    "choices": [
      "Lew Alcindor",
      "Bill Walton",
      "Jamaal Wilkes",
      "Sidney Wicks"
    ],
    "correct": 1
  },
  {
    "question": "Who won the 2022 men's title?",
    "choices": [
      "Kansas",
      "UNC",
      "Villanova",
      "Duke"
    ],
    "correct": 0
  },
  {
    "question": "Which is Kentucky's biggest in-state rival?",
    "choices": [
      "Louisville",
      "Tennessee",
      "Florida",
      "Auburn"
    ],
    "correct": 0
  },
  {
    "question": "Who coaches South Carolina women's powerhouse?",
    "choices": [
      "Dawn Staley",
      "Geno Auriemma",
      "Kim Mulkey",
      "Tara VanDerveer"
    ],
    "correct": 0
  },
  {
    "question": "Which UConn coach won 11 women's titles?",
    "choices": [
      "Auriemma",
      "Staley",
      "Mulkey",
      "VanDerveer"
    ],
    "correct": 0
  },
  {
    "question": "What round comes right before the Final Four?",
    "choices": [
      "Sweet 16",
      "Elite 8",
      "Round of 32",
      "First Four"
    ],
    "correct": 1
  },
  {
    "question": "Which player won Naismith Player of the Year three times?",
    "choices": [
      "Caitlin Clark",
      "Tyler Hansbrough",
      "Christian Laettner",
      "Anthony Davis"
    ],
    "correct": 0
  },
  {
    "question": "Where did UCLA play home games during their dynasty?",
    "choices": [
      "Pauley Pavilion",
      "Madison Square Garden",
      "Cameron Indoor",
      "The Pit"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NcaaBasketballQuizSettings): NcaaBasketballQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NcaaBasketballQuizState, action: NcaaBasketballQuizAction): NcaaBasketballQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NcaaBasketballQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
