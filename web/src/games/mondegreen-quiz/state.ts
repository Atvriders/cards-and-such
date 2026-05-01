import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MondegreenQuizSettings { questions: "8" | "10" | "12"; }
export interface MondegreenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MondegreenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'Excuse me while I kiss this guy' is a mondegreen of? (Hendrix)",
    "choices": [
      "kiss the sky",
      "kiss goodbye",
      "miss the sky",
      "kiss this sky"
    ],
    "correct": 0
  },
  {
    "question": "'There's a bathroom on the right' is from?",
    "choices": [
      "Bad Moon Rising (CCR)",
      "Stairway to Heaven",
      "Hotel California",
      "Free Bird"
    ],
    "correct": 0
  },
  {
    "question": "'Hold me closer Tony Danza' is a mondegreen of?",
    "choices": [
      "tiny dancer (Elton John)",
      "Spanish dancer",
      "lonely dancer",
      "tonight dancer"
    ],
    "correct": 0
  },
  {
    "question": "'Sweet dreams are made of cheese' is a mondegreen of?",
    "choices": [
      "made of this (Eurythmics)",
      "made of bliss",
      "made of these",
      "made of cheese"
    ],
    "correct": 0
  },
  {
    "question": "'The girl with colitis goes by' is a mondegreen of?",
    "choices": [
      "the girl with kaleidoscope eyes",
      "the girl with colorful eyes",
      "the girl with collie's eyes",
      "the girl with golden eyes"
    ],
    "correct": 0
  },
  {
    "question": "'Olive, the other reindeer' is a mondegreen of?",
    "choices": [
      "all of the other reindeer",
      "Olive, all reindeer",
      "alive, the other reindeer",
      "all the other reindeer"
    ],
    "correct": 0
  },
  {
    "question": "'Round John Virgin' is a mondegreen of?",
    "choices": [
      "round yon virgin (Silent Night)",
      "around John Virgin",
      "round on virgin",
      "round one virgin"
    ],
    "correct": 0
  },
  {
    "question": "'Gladly, the cross-eyed bear' is a mondegreen of?",
    "choices": [
      "gladly the cross I'd bear",
      "gladly across I bear",
      "gladly across the bear",
      "gladly cross I'd bear"
    ],
    "correct": 0
  },
  {
    "question": "'Jose, can you see' is a mondegreen of?",
    "choices": [
      "Oh say, can you see",
      "Hey Jose, can you see",
      "Oh see, Jose",
      "Jose, see can you"
    ],
    "correct": 0
  },
  {
    "question": "'Are friends electric?' (real lyric, mondegreen-prone)",
    "choices": [
      "are friends electric (Numan)",
      "are fence electric",
      "are fronds electric",
      "are friends eclectic"
    ],
    "correct": 0
  },
  {
    "question": "'Living La Vida Loca' often heard as?",
    "choices": [
      "leaving the V the local",
      "living the bid the local",
      "living the v the loca",
      "leaving the vida loca"
    ],
    "correct": 0
  },
  {
    "question": "'Don't go Jason Waterfalls' is a mondegreen of?",
    "choices": [
      "don't go chasing waterfalls (TLC)",
      "don't go racing waterfalls",
      "don't go facing waterfalls",
      "don't go Jason's waterfalls"
    ],
    "correct": 0
  },
  {
    "question": "'Hold me closer, Edna Turnblad' isn't standard; classic for tiny dancer is?",
    "choices": [
      "Tony Danza",
      "Edna Turnblad",
      "Tony Romo",
      "Tony the Tiger"
    ],
    "correct": 0
  },
  {
    "question": "'Big ol' Jed had a light on' is a mondegreen of?",
    "choices": [
      "Big Old Jet Airliner (Steve Miller)",
      "Big ol' Jed and a light on",
      "Big jet had a light on",
      "Big bull jet airliner"
    ],
    "correct": 0
  },
  {
    "question": "'Wrapped up like a douche' is a mondegreen of?",
    "choices": [
      "revved up like a deuce (Manfred Mann)",
      "wrapped up like a deuce",
      "revved up like a douche",
      "lapped up like a deuce"
    ],
    "correct": 0
  },
  {
    "question": "'Bring me an iron lung' is a mondegreen of? (Star-Spangled)",
    "choices": [
      "Bombs bursting in air",
      "Bring me an iron lung",
      "Free me an iron lung",
      "Bombs in iron lung"
    ],
    "correct": 0
  },
  {
    "question": "'Dancing queen, feel the beat from the tangerine' is a mondegreen of?",
    "choices": [
      "from the tambourine (ABBA)",
      "from the trampoline",
      "from the marine",
      "from the magazine"
    ],
    "correct": 0
  },
  {
    "question": "'The ants are my friends' is a mondegreen of?",
    "choices": [
      "the answer my friend (Blowin' in the Wind)",
      "the ants are my friend",
      "the aunts are my friends",
      "the chance is my friend"
    ],
    "correct": 0
  },
  {
    "question": "'Last night I dreamt of some bagels' is a mondegreen of?",
    "choices": [
      "some bagels = San Pedro? (no): some bagels for 'San Pedro'?",
      "some bagels",
      "of San Pedro",
      "of some angels"
    ],
    "correct": 0
  },
  {
    "question": "'Reverend Blue Jeans' is a mondegreen of?",
    "choices": [
      "Forever in Blue Jeans (Neil Diamond)",
      "Reverend Blue Jeans",
      "Forever blue jeans",
      "Reverence blue jeans"
    ],
    "correct": 0
  },
  {
    "question": "'Sue Lawley' is a mondegreen of? (Beatles)",
    "choices": [
      "So lonely (or 'so lowly') / 'Sue Lawley'='solely' in 'Solely'",
      "Sue Lawley",
      "So lovely",
      "So lonely"
    ],
    "correct": 0
  },
  {
    "question": "'I led the pigeons to the flag' is a mondegreen of?",
    "choices": [
      "I pledge allegiance to the flag",
      "I led the pigeons to the flag",
      "I let the pigeons to the flag",
      "I lead the pigeons to the flag"
    ],
    "correct": 0
  },
  {
    "question": "'Donuts make my brown eyes blue' is a mondegreen of?",
    "choices": [
      "don't it make my brown eyes blue (Crystal Gayle)",
      "donuts make my brown eyes blue",
      "don't make my brown eyes blue",
      "doughnuts make my eyes blue"
    ],
    "correct": 0
  },
  {
    "question": "'There's a wino down the road' is a mondegreen of?",
    "choices": [
      "there's a bad moon on the rise (CCR)",
      "there's a wino down the road",
      "there's a wine on the road",
      "there's a vino down the road"
    ],
    "correct": 0
  },
  {
    "question": "'I'll never leave your pizza burning' is a mondegreen of?",
    "choices": [
      "I'll never be your beast of burden (Stones)",
      "I'll never leave your pizza burning",
      "I'll never be your beast and burning",
      "I'll never leave your beast of burden"
    ],
    "correct": 0
  },
  {
    "question": "'Secret Asian man' is a mondegreen of?",
    "choices": [
      "Secret Agent Man",
      "Secret Asian Man",
      "Secret aging man",
      "Secret Asian's man"
    ],
    "correct": 0
  },
  {
    "question": "'Midnight after you're wasted' is a mondegreen of?",
    "choices": [
      "midnight at the oasis",
      "midnight after you're wasted",
      "midnight in the oasis",
      "midnight you're wasted"
    ],
    "correct": 0
  },
  {
    "question": "'I want to rock and roll all night and part of every day' is a mondegreen of?",
    "choices": [
      "party every day (KISS)",
      "and part of every day",
      "and party of every day",
      "and partly every day"
    ],
    "correct": 0
  },
  {
    "question": "'Calling Jamaica' is a mondegreen of?",
    "choices": [
      "Calling Major Tom (Bowie)",
      "Calling Jamaica",
      "Calling Jamaca",
      "Calling Jamaican"
    ],
    "correct": 0
  },
  {
    "question": "'There's a baboon on the rise' is a mondegreen of?",
    "choices": [
      "bad moon on the rise (CCR)",
      "baboon on the rise",
      "balloon on the rise",
      "bad tune on the rise"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MondegreenQuizSettings): MondegreenQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MondegreenQuizState, action: MondegreenQuizAction): MondegreenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MondegreenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
