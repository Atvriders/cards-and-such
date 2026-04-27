import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ClassicalMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface ClassicalMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ClassicalMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which period came first in Western classical music?", choices: ["Classical", "Romantic", "Baroque", "Modern"], correct: 2 },
  { question: "Which instrument is Paganini most famous for?", choices: ["Piano", "Cello", "Violin", "Flute"], correct: 2 },
  { question: "Beethoven's 'Ode to Joy' is from which symphony?", choices: ["5th", "6th", "7th", "9th"], correct: 3 },
  { question: "Who composed 'The Well-Tempered Clavier'?", choices: ["Handel", "Telemann", "Bach", "Vivaldi"], correct: 2 },
  { question: "The term 'sonata' originally referred to music that was?", choices: ["Sung", "Played", "Danced to", "Improvised"], correct: 1 },
  { question: "Which composer wrote 'The Four Seasons'?", choices: ["Bach", "Handel", "Vivaldi", "Telemann"], correct: 2 },
  { question: "Mozart's opera 'Don Giovanni' is about?", choices: ["A general", "A legendary seducer", "A king", "A wizard"], correct: 1 },
  { question: "Who composed 'Hungarian Rhapsodies' for piano?", choices: ["Chopin", "Brahms", "Schumann", "Liszt"], correct: 3 },
  { question: "Which nationality was Frédéric Chopin?", choices: ["German", "French", "Polish", "Czech"], correct: 2 },
  { question: "The 'Symphonie Fantastique' was composed by?", choices: ["Liszt", "Berlioz", "Saint-Saëns", "Meyerbeer"], correct: 1 },
  { question: "Which composer wrote 'Pictures at an Exhibition'?", choices: ["Tchaikovsky", "Rimsky-Korsakov", "Mussorgsky", "Borodin"], correct: 2 },
  { question: "Handel's most famous oratorio is?", choices: ["Israel in Egypt", "The Creation", "Messiah", "Elijah"], correct: 2 },
  { question: "The Classical period (in music) spans roughly from 1750 to?", choices: ["1800", "1820", "1850", "1900"], correct: 1 },
  { question: "Which composer had a famous rivalry with Salieri?", choices: ["Haydn", "Mozart", "Beethoven", "Schubert"], correct: 1 },
  { question: "Brahms wrote how many symphonies?", choices: ["2", "3", "4", "6"], correct: 2 },
  { question: "What does 'forte' mean in music?", choices: ["Soft", "Slow", "Loud", "Fast"], correct: 2 },
  { question: "Which composer is associated with the 'Surprise Symphony'?", choices: ["Mozart", "Haydn", "Beethoven", "Schubert"], correct: 1 },
  { question: "The opera 'Norma' was composed by?", choices: ["Verdi", "Rossini", "Bellini", "Donizetti"], correct: 2 },
  { question: "The 'Moonlight Sonata' is Op. 27 No. 2 by?", choices: ["Mozart", "Schubert", "Beethoven", "Haydn"], correct: 2 },
  { question: "Which Italian city is famous for its opera house La Fenice?", choices: ["Rome", "Florence", "Venice", "Milan"], correct: 2 },
  { question: "Schubert's 'Trout Quintet' is named after?", choices: ["A river", "A fish", "A village", "A person"], correct: 1 },
  { question: "Who composed 'Peer Gynt Suite'?", choices: ["Sibelius", "Nielsen", "Grieg", "Svendsen"], correct: 2 },
  { question: "The term 'cadenza' in classical music refers to?", choices: ["A type of chord", "A solo passage near the end of a movement", "A tempo marking", "A key signature"], correct: 1 },
  { question: "Rachmaninoff is most associated with which country?", choices: ["Poland", "Germany", "Russia", "France"], correct: 2 },
  { question: "Which Baroque composer is known as 'the Red Priest'?", choices: ["Handel", "Bach", "Vivaldi", "Corelli"], correct: 2 },
  { question: "Haydn is known as 'Father of the Symphony' — he wrote approximately how many?", choices: ["30", "60", "104", "200"], correct: 2 },
  { question: "Debussy's 'Prelude to the Afternoon of a Faun' is inspired by poetry by?", choices: ["Verlaine", "Rimbaud", "Mallarmé", "Baudelaire"], correct: 2 },
  { question: "Which term describes the speed of music?", choices: ["Dynamics", "Tempo", "Timbre", "Texture"], correct: 1 },
  { question: "The opera 'The Marriage of Figaro' was composed by?", choices: ["Haydn", "Mozart", "Gluck", "Salieri"], correct: 1 },
  { question: "Elgar's 'Enigma Variations' is a piece for?", choices: ["Solo piano", "String quartet", "Orchestra", "Chorus and orchestra"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ClassicalMusicQuizSettings): ClassicalMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ClassicalMusicQuizState, action: ClassicalMusicQuizAction): ClassicalMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ClassicalMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
