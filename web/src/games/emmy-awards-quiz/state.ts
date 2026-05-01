import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EmmyAwardsQuizSettings { questions: "10" | "20"; }
export interface EmmyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EmmyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First Emmy Awards were held in?",
    "choices": [
      "1947",
      "1949",
      "1951",
      "1953"
    ],
    "correct": 1
  },
  {
    "question": "Emmys honor excellence in?",
    "choices": [
      "Film",
      "Theatre",
      "Television",
      "Radio"
    ],
    "correct": 2
  },
  {
    "question": "Emmy is short for?",
    "choices": [
      "Emily",
      "Image orthicon (Immy)",
      "Embassy",
      "Emmaus"
    ],
    "correct": 1
  },
  {
    "question": "Primetime Emmys are presented by?",
    "choices": [
      "NATAS",
      "ATAS",
      "HFPA",
      "SAG"
    ],
    "correct": 1
  },
  {
    "question": "Daytime Emmys are presented by?",
    "choices": [
      "ATAS",
      "NATAS",
      "BAFTA",
      "HFPA"
    ],
    "correct": 1
  },
  {
    "question": "Most Emmys won by a comedy series (record holder)?",
    "choices": [
      "Frasier",
      "Modern Family",
      "Game of Thrones",
      "Saturday Night Live"
    ],
    "correct": 3
  },
  {
    "question": "Drama with most Emmys (record at 59)?",
    "choices": [
      "Game of Thrones",
      "The Sopranos",
      "Breaking Bad",
      "Mad Men"
    ],
    "correct": 0
  },
  {
    "question": "Frasier set record for consecutive Outstanding Comedy wins?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 2
  },
  {
    "question": "Cheers won Outstanding Comedy how many times?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Mad Men won Outstanding Drama how many times?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Breaking Bad's Outstanding Drama wins?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "Game of Thrones won Outstanding Drama how many times?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "First TV show to win Outstanding Drama Series?",
    "choices": [
      "Studio One",
      "Dragnet",
      "Climax!",
      "Playhouse 90"
    ],
    "correct": 0
  },
  {
    "question": "The West Wing won Outstanding Drama in consecutive years?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "First streaming series nominated for Outstanding Drama?",
    "choices": [
      "House of Cards",
      "Orange Is the New Black",
      "Stranger Things",
      "Bloodline"
    ],
    "correct": 0
  },
  {
    "question": "First streaming series to win Outstanding Drama?",
    "choices": [
      "Stranger Things",
      "The Crown",
      "Handmaid's Tale",
      "Succession"
    ],
    "correct": 2
  },
  {
    "question": "Succession won Outstanding Drama how many times?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "Schitt's Creek's historic Emmy night was in?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 2
  },
  {
    "question": "Schitt's Creek swept how many comedy categories in 2020?",
    "choices": [
      "5",
      "6",
      "7",
      "9"
    ],
    "correct": 2
  },
  {
    "question": "Most Emmy wins by a performer (record)?",
    "choices": [
      "Cloris Leachman",
      "Sheldon Leonard",
      "Julia Louis-Dreyfus",
      "Ed Asner"
    ],
    "correct": 0
  },
  {
    "question": "Julia Louis-Dreyfus's lead actress comedy Emmys?",
    "choices": [
      "4",
      "5",
      "6",
      "8"
    ],
    "correct": 1
  },
  {
    "question": "Don Knotts won 5 Emmys for which show?",
    "choices": [
      "The Andy Griffith Show",
      "Three's Company",
      "Mayberry RFD",
      "Get Smart"
    ],
    "correct": 0
  },
  {
    "question": "Carl Reiner won Emmys writing for?",
    "choices": [
      "I Love Lucy",
      "Dick Van Dyke Show",
      "All in the Family",
      "Mary Tyler Moore"
    ],
    "correct": 1
  },
  {
    "question": "Mary Tyler Moore Show's record Emmy wins?",
    "choices": [
      "19",
      "21",
      "29",
      "32"
    ],
    "correct": 2
  },
  {
    "question": "Outstanding Limited Series 2017 winner?",
    "choices": [
      "Big Little Lies",
      "Feud",
      "Fargo",
      "The Night Of"
    ],
    "correct": 0
  },
  {
    "question": "Chernobyl won Outstanding Limited in?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "The Crown won Outstanding Drama in?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 2
  },
  {
    "question": "Ted Lasso won Outstanding Comedy how many times?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "Saturday Night Live's record total Emmy wins is over?",
    "choices": [
      "50",
      "75",
      "100",
      "125"
    ],
    "correct": 2
  },
  {
    "question": "Emmy statuette depicts a winged woman holding?",
    "choices": [
      "Atom",
      "Globe",
      "Lyre",
      "Camera"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EmmyAwardsQuizSettings): EmmyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EmmyAwardsQuizState, action: EmmyAwardsQuizAction): EmmyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EmmyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
