import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TennisGreatsQuizSettings { questions: "10" | "20" | "30"; }
export interface TennisGreatsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TennisGreatsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How many Grand Slams has Roger Federer won?",
    "choices": [
      "18",
      "20",
      "22",
      "24"
    ],
    "correct": 1
  },
  {
    "question": "Rafael Nadal is best known on which surface?",
    "choices": [
      "Clay",
      "Grass",
      "Hard",
      "Carpet"
    ],
    "correct": 0
  },
  {
    "question": "How many French Open titles has Nadal won?",
    "choices": [
      "12",
      "13",
      "14",
      "15"
    ],
    "correct": 2
  },
  {
    "question": "Novak Djokovic comes from?",
    "choices": [
      "Croatia",
      "Serbia",
      "Slovenia",
      "Russia"
    ],
    "correct": 1
  },
  {
    "question": "Serena Williams has how many singles Slams?",
    "choices": [
      "21",
      "22",
      "23",
      "24"
    ],
    "correct": 2
  },
  {
    "question": "Steffi Graf won how many singles Slams?",
    "choices": [
      "18",
      "20",
      "22",
      "24"
    ],
    "correct": 2
  },
  {
    "question": "Martina Navratilova won how many Wimbledon singles titles?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 2
  },
  {
    "question": "Who was Bjorn Borg's biggest rival?",
    "choices": [
      "McEnroe",
      "Connors",
      "Lendl",
      "Becker"
    ],
    "correct": 0
  },
  {
    "question": "Pete Sampras finished with how many singles Slams?",
    "choices": [
      "12",
      "13",
      "14",
      "15"
    ],
    "correct": 2
  },
  {
    "question": "Who is 'Big Mac'?",
    "choices": [
      "John McEnroe",
      "Pete Sampras",
      "Andre Agassi",
      "Boris Becker"
    ],
    "correct": 0
  },
  {
    "question": "Andre Agassi's career grand slam includes wins on?",
    "choices": [
      "All four surfaces (all four Slams)",
      "Two Slams",
      "Three Slams",
      "Just Wimbledon"
    ],
    "correct": 0
  },
  {
    "question": "Who has won the most Wimbledon men's singles titles in the Open Era?",
    "choices": [
      "Federer",
      "Sampras",
      "Djokovic",
      "Nadal"
    ],
    "correct": 0
  },
  {
    "question": "Margaret Court won how many Slams (singles)?",
    "choices": [
      "20",
      "22",
      "24",
      "26"
    ],
    "correct": 2
  },
  {
    "question": "Billie Jean King is famous for the?",
    "choices": [
      "Battle of the Sexes",
      "First Open Era win",
      "Founding the WTA",
      "All of the above"
    ],
    "correct": 3
  },
  {
    "question": "Chris Evert's signature surface?",
    "choices": [
      "Clay",
      "Grass",
      "Hard",
      "Carpet"
    ],
    "correct": 0
  },
  {
    "question": "Boris Becker won Wimbledon at age?",
    "choices": [
      "17",
      "19",
      "21",
      "23"
    ],
    "correct": 0
  },
  {
    "question": "Who was the first man to win all four Slams in a calendar year (Open Era)?",
    "choices": [
      "Rod Laver",
      "Don Budge",
      "No one in Open Era (Laver did it pre-and-post)",
      "Jimmy Connors"
    ],
    "correct": 0
  },
  {
    "question": "Rod Laver is from?",
    "choices": [
      "USA",
      "UK",
      "Australia",
      "Germany"
    ],
    "correct": 2
  },
  {
    "question": "How many Slams has Djokovic won (as of 2024)?",
    "choices": [
      "20",
      "22",
      "24",
      "25"
    ],
    "correct": 2
  },
  {
    "question": "Who plays in 'Murray Mound' fame at Wimbledon?",
    "choices": [
      "Andy Murray",
      "Henman",
      "Cash",
      "Krajicek"
    ],
    "correct": 0
  },
  {
    "question": "Justine Henin retired with how many Slams?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 0
  },
  {
    "question": "Stefan Edberg played which style?",
    "choices": [
      "Serve and volley",
      "Baseline",
      "Counterpunch",
      "All-court"
    ],
    "correct": 0
  },
  {
    "question": "Ivan Lendl was famous for his?",
    "choices": [
      "Topspin forehand",
      "Net play",
      "Slice",
      "Lefty serve"
    ],
    "correct": 0
  },
  {
    "question": "Maria Sharapova won her first Slam at age?",
    "choices": [
      "17",
      "19",
      "21",
      "23"
    ],
    "correct": 0
  },
  {
    "question": "Who is Naomi Osaka's first Slam title?",
    "choices": [
      "US Open 2018",
      "French Open",
      "Australian Open",
      "Wimbledon"
    ],
    "correct": 0
  },
  {
    "question": "Who are the 'Big Three' of men's tennis?",
    "choices": [
      "Federer, Nadal, Djokovic",
      "Sampras, Agassi, Becker",
      "Borg, Connors, McEnroe",
      "Edberg, Lendl, Wilander"
    ],
    "correct": 0
  },
  {
    "question": "Court speed at Roland Garros is?",
    "choices": [
      "Slow (clay)",
      "Fast (grass)",
      "Medium (hard)",
      "Fastest (carpet)"
    ],
    "correct": 0
  },
  {
    "question": "Court speed at Wimbledon is?",
    "choices": [
      "Fast (grass)",
      "Slow (clay)",
      "Medium (hard)",
      "Slowest (carpet)"
    ],
    "correct": 0
  },
  {
    "question": "Australian Open is played in?",
    "choices": [
      "Melbourne",
      "Sydney",
      "Brisbane",
      "Perth"
    ],
    "correct": 0
  },
  {
    "question": "Who has the most weeks at world No. 1 in men's tennis history?",
    "choices": [
      "Federer",
      "Nadal",
      "Djokovic",
      "Sampras"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TennisGreatsQuizSettings): TennisGreatsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TennisGreatsQuizState, action: TennisGreatsQuizAction): TennisGreatsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TennisGreatsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
