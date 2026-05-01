import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SuperBowlQuizSettings { questions: "10" | "20" | "30"; }
export interface SuperBowlQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SuperBowlQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who won Super Bowl I?",
    "choices": [
      "Packers",
      "Chiefs",
      "Cowboys",
      "Steelers"
    ],
    "correct": 0
  },
  {
    "question": "Which team has the most Super Bowl wins?",
    "choices": [
      "Patriots",
      "Cowboys",
      "Steelers",
      "49ers"
    ],
    "correct": 2
  },
  {
    "question": "Who is the only player with 7 Super Bowl rings?",
    "choices": [
      "Brady",
      "Montana",
      "Manning",
      "Rodgers"
    ],
    "correct": 0
  },
  {
    "question": "Where was Super Bowl LVIII held in 2024?",
    "choices": [
      "Las Vegas",
      "Los Angeles",
      "Tampa",
      "Atlanta"
    ],
    "correct": 0
  },
  {
    "question": "Which team won Super Bowl LVIII?",
    "choices": [
      "49ers",
      "Chiefs",
      "Eagles",
      "Bengals"
    ],
    "correct": 1
  },
  {
    "question": "Who is the youngest QB to win a Super Bowl?",
    "choices": [
      "Roethlisberger",
      "Brady",
      "Mahomes",
      "Marino"
    ],
    "correct": 0
  },
  {
    "question": "Who headlined the 2020 Super Bowl halftime show?",
    "choices": [
      "J.Lo and Shakira",
      "Beyonce",
      "Madonna",
      "Prince"
    ],
    "correct": 0
  },
  {
    "question": "Who was Super Bowl XLIX MVP?",
    "choices": [
      "Brady",
      "Lynch",
      "Edelman",
      "Butler"
    ],
    "correct": 0
  },
  {
    "question": "Which team blew a 28-3 lead in Super Bowl LI?",
    "choices": [
      "Falcons",
      "Panthers",
      "Seahawks",
      "Broncos"
    ],
    "correct": 0
  },
  {
    "question": "Who threw the pass for the 2008 'Helmet Catch'?",
    "choices": [
      "Eli Manning",
      "Brady",
      "Tyree",
      "Roethlisberger"
    ],
    "correct": 0
  },
  {
    "question": "Which Super Bowl featured the 'Philly Special'?",
    "choices": [
      "LII",
      "LI",
      "LIII",
      "LIV"
    ],
    "correct": 0
  },
  {
    "question": "Who won Super Bowl XLVIII?",
    "choices": [
      "Seahawks",
      "Broncos",
      "Patriots",
      "49ers"
    ],
    "correct": 0
  },
  {
    "question": "Who scored the first touchdown in Super Bowl history?",
    "choices": [
      "Max McGee",
      "Bart Starr",
      "Don Chandler",
      "Elijah Pitts"
    ],
    "correct": 0
  },
  {
    "question": "Which team is famously 0-4 in Super Bowls?",
    "choices": [
      "Vikings",
      "Browns",
      "Lions",
      "Texans"
    ],
    "correct": 0
  },
  {
    "question": "Who was MVP of Super Bowl LV?",
    "choices": [
      "Brady",
      "Mahomes",
      "Gronkowski",
      "Fournette"
    ],
    "correct": 0
  },
  {
    "question": "Which team won Super Bowl LVII?",
    "choices": [
      "Chiefs",
      "Eagles",
      "49ers",
      "Bengals"
    ],
    "correct": 0
  },
  {
    "question": "Who coached the Patriots dynasty?",
    "choices": [
      "Belichick",
      "Parcells",
      "Carroll",
      "Reid"
    ],
    "correct": 0
  },
  {
    "question": "In what year was Super Bowl I played?",
    "choices": [
      "1965",
      "1966",
      "1967",
      "1968"
    ],
    "correct": 2
  },
  {
    "question": "Who is famous for the 'Immaculate Reception'?",
    "choices": [
      "Franco Harris",
      "Terry Bradshaw",
      "Lynn Swann",
      "Mean Joe Greene"
    ],
    "correct": 0
  },
  {
    "question": "Which team won Super Bowl XXXVI to start the Patriots dynasty?",
    "choices": [
      "Patriots",
      "Rams",
      "Eagles",
      "Steelers"
    ],
    "correct": 0
  },
  {
    "question": "Who won Super Bowl LIV MVP?",
    "choices": [
      "Mahomes",
      "Reid",
      "Hill",
      "Kelce"
    ],
    "correct": 0
  },
  {
    "question": "Which kicker missed a key field goal in Super Bowl XXV?",
    "choices": [
      "Scott Norwood",
      "Adam Vinatieri",
      "Gary Anderson",
      "Mike Vanderjagt"
    ],
    "correct": 0
  },
  {
    "question": "Who was QB for the 1985 Bears?",
    "choices": [
      "Jim McMahon",
      "Walter Payton",
      "Mike Ditka",
      "Jim Kelly"
    ],
    "correct": 0
  },
  {
    "question": "What is the Super Bowl trophy called?",
    "choices": [
      "Lombardi Trophy",
      "Halas Trophy",
      "Brady Trophy",
      "NFL Cup"
    ],
    "correct": 0
  },
  {
    "question": "Which team won Super Bowl 50?",
    "choices": [
      "Broncos",
      "Panthers",
      "Patriots",
      "Cardinals"
    ],
    "correct": 0
  },
  {
    "question": "Who was MVP of Super Bowl 50?",
    "choices": [
      "Von Miller",
      "Peyton Manning",
      "Cam Newton",
      "DeMarcus Ware"
    ],
    "correct": 0
  },
  {
    "question": "Which QB won Super Bowls with two different teams?",
    "choices": [
      "Peyton Manning",
      "Brees",
      "Brady",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Where was Super Bowl LVI held?",
    "choices": [
      "Inglewood",
      "Tampa",
      "Miami",
      "Phoenix"
    ],
    "correct": 0
  },
  {
    "question": "Which kicker won Super Bowl MVP for the Colts (1971)?",
    "choices": [
      "Adam Vinatieri",
      "Jim O'Brien",
      "Ray Wersching",
      "Gary Anderson"
    ],
    "correct": 1
  },
  {
    "question": "Who threw the game-winning TD in Super Bowl LI overtime?",
    "choices": [
      "Brady",
      "White",
      "Edelman",
      "Bennett"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SuperBowlQuizSettings): SuperBowlQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SuperBowlQuizState, action: SuperBowlQuizAction): SuperBowlQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SuperBowlQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
