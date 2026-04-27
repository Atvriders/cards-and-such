import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NflLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface NflLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NflLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How many Super Bowls did Tom Brady win?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Joe Montana won how many Super Bowls?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Jerry Rice is regarded as the greatest at which position?",
    "choices": [
      "QB",
      "WR",
      "RB",
      "TE"
    ],
    "correct": 1
  },
  {
    "question": "Jerry Rice spent most of his career with?",
    "choices": [
      "49ers",
      "Cowboys",
      "Patriots",
      "Packers"
    ],
    "correct": 0
  },
  {
    "question": "Peyton Manning won Super Bowls with which two teams?",
    "choices": [
      "Colts and Broncos",
      "Colts only",
      "Broncos only",
      "Giants and Colts"
    ],
    "correct": 0
  },
  {
    "question": "Eli Manning won how many Super Bowls?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "Walter Payton played for which team?",
    "choices": [
      "Bears",
      "Packers",
      "Lions",
      "Vikings"
    ],
    "correct": 0
  },
  {
    "question": "Emmitt Smith is the all-time leading rusher; he played for?",
    "choices": [
      "Cowboys (mostly)",
      "Eagles",
      "Giants",
      "Redskins"
    ],
    "correct": 0
  },
  {
    "question": "Who held the season passing-yards record before being eclipsed?",
    "choices": [
      "Dan Marino (long held)",
      "Tom Brady (eclipsed Marino)",
      "Peyton Manning (most recent of these eclipsed)",
      "All three set records"
    ],
    "correct": 3
  },
  {
    "question": "Who is nicknamed 'Sweetness'?",
    "choices": [
      "Walter Payton",
      "Barry Sanders",
      "Jim Brown",
      "Marshall Faulk"
    ],
    "correct": 0
  },
  {
    "question": "Barry Sanders played for which team?",
    "choices": [
      "Lions",
      "Packers",
      "Vikings",
      "Bears"
    ],
    "correct": 0
  },
  {
    "question": "Jim Brown played for which team?",
    "choices": [
      "Browns",
      "Steelers",
      "Giants",
      "Bears"
    ],
    "correct": 0
  },
  {
    "question": "Lawrence Taylor played for?",
    "choices": [
      "Giants",
      "Eagles",
      "Redskins",
      "Cowboys"
    ],
    "correct": 0
  },
  {
    "question": "Who was the dominant QB of the 80s 49ers?",
    "choices": [
      "Joe Montana",
      "Steve Young",
      "John Brodie",
      "Jeff Garcia"
    ],
    "correct": 0
  },
  {
    "question": "Reggie White played mostly for which two teams?",
    "choices": [
      "Eagles and Packers",
      "Cowboys and 49ers",
      "Bears and Vikings",
      "Giants and Falcons"
    ],
    "correct": 0
  },
  {
    "question": "Brett Favre was famous on which team?",
    "choices": [
      "Packers",
      "Vikings",
      "Jets",
      "All three"
    ],
    "correct": 3
  },
  {
    "question": "John Elway played his career for?",
    "choices": [
      "Broncos",
      "Raiders",
      "Chiefs",
      "Cowboys"
    ],
    "correct": 0
  },
  {
    "question": "Dan Marino played for?",
    "choices": [
      "Dolphins",
      "Jets",
      "Patriots",
      "Bills"
    ],
    "correct": 0
  },
  {
    "question": "Who is the all-time NFL touchdown receptions leader?",
    "choices": [
      "Jerry Rice",
      "Randy Moss",
      "Larry Fitzgerald",
      "Terrell Owens"
    ],
    "correct": 0
  },
  {
    "question": "Randy Moss famously played for?",
    "choices": [
      "Vikings",
      "Patriots",
      "Raiders",
      "All three"
    ],
    "correct": 3
  },
  {
    "question": "Who is the NFL's all-time sack leader (since stat tracked)?",
    "choices": [
      "Bruce Smith",
      "Reggie White",
      "Lawrence Taylor",
      "Deacon Jones"
    ],
    "correct": 0
  },
  {
    "question": "Deacon Jones popularized which term?",
    "choices": [
      "Sack",
      "Blitz",
      "Pick six",
      "Audible"
    ],
    "correct": 0
  },
  {
    "question": "Who is Patrick Mahomes's main team?",
    "choices": [
      "Chiefs",
      "Cowboys",
      "Cardinals",
      "Raiders"
    ],
    "correct": 0
  },
  {
    "question": "Aaron Rodgers played most of his career for?",
    "choices": [
      "Packers",
      "Jets",
      "Bears",
      "Giants"
    ],
    "correct": 0
  },
  {
    "question": "Drew Brees set passing records with?",
    "choices": [
      "Saints",
      "Chargers",
      "Cowboys",
      "Falcons"
    ],
    "correct": 0
  },
  {
    "question": "Who coached the Patriots dynasty?",
    "choices": [
      "Bill Belichick",
      "Bill Parcells",
      "Tom Coughlin",
      "Mike Tomlin"
    ],
    "correct": 0
  },
  {
    "question": "Vince Lombardi coached which Super Bowl winners?",
    "choices": [
      "Packers",
      "Cowboys",
      "Chiefs",
      "Browns"
    ],
    "correct": 0
  },
  {
    "question": "Joe Namath guaranteed and won which Super Bowl?",
    "choices": [
      "Super Bowl III",
      "Super Bowl I",
      "Super Bowl V",
      "Super Bowl X"
    ],
    "correct": 0
  },
  {
    "question": "Who is Deion Sanders known as?",
    "choices": [
      "Prime Time",
      "Neon Deion",
      "Coach Prime",
      "All of the above"
    ],
    "correct": 3
  },
  {
    "question": "Tom Brady was drafted in which round?",
    "choices": [
      "1st",
      "3rd",
      "6th",
      "Undrafted"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NflLegendsQuizSettings): NflLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NflLegendsQuizState, action: NflLegendsQuizAction): NflLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NflLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
