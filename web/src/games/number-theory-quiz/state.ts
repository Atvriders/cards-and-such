import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface NumberTheoryQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NumberTheoryQuizSettings { questions: "10" | "20"; }
export interface NumberTheoryQuizState { questions: NumberTheoryQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NumberTheoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: NumberTheoryQuizQuestion[] = [
  { question: "A prime number is divisible by?", choices: ["1 only","Itself only","1 and itself","All integers"], correct: 2 },
  { question: "Smallest prime number?", choices: ["0","1","2","3"], correct: 2 },
  { question: "Is 1 a prime?", choices: ["Yes","No","Sometimes","Depends"], correct: 1 },
  { question: "Smallest even prime?", choices: ["2","4","6","8"], correct: 0 },
  { question: "GCD of 12 and 18?", choices: ["3","4","6","12"], correct: 2 },
  { question: "LCM of 4 and 6?", choices: ["8","10","12","24"], correct: 2 },
  { question: "Fundamental theorem of arithmetic states every integer >1 has?", choices: ["A unique square root","A unique prime factorization","Infinite divisors","No factors"], correct: 1 },
  { question: "Euclidean algorithm computes?", choices: ["LCM","GCD","Primes","Factorials"], correct: 1 },
  { question: "If a ≡ b (mod n), then n divides?", choices: ["a+b","a−b","ab","a/b"], correct: 1 },
  { question: "Fermat's little theorem: a^p ≡ ? (mod p) for prime p, gcd(a,p)=1", choices: ["0","1","a","p"], correct: 2 },
  { question: "a^(p−1) ≡ ? (mod p) (Fermat)", choices: ["0","1","a","p−1"], correct: 1 },
  { question: "Euler's totient φ(p) for prime p?", choices: ["1","p","p−1","p+1"], correct: 2 },
  { question: "φ(12) = ?", choices: ["2","4","6","12"], correct: 1 },
  { question: "Goldbach's conjecture: every even integer >2 is the sum of?", choices: ["Two primes","Three primes","Two squares","A prime and a square"], correct: 0 },
  { question: "Twin primes are pairs differing by?", choices: ["1","2","3","6"], correct: 1 },
  { question: "Number of primes is?", choices: ["Finite","Infinite","Exactly 100","Unknown"], correct: 1 },
  { question: "First proof that primes are infinite is due to?", choices: ["Gauss","Euclid","Fermat","Euler"], correct: 1 },
  { question: "A perfect number equals the sum of its?", choices: ["Digits","Proper divisors","Prime factors","Squares"], correct: 1 },
  { question: "Smallest perfect number?", choices: ["4","6","8","12"], correct: 1 },
  { question: "Mersenne prime form?", choices: ["2^n+1","2^n−1","n²+1","n!+1"], correct: 1 },
  { question: "Fermat primes have form?", choices: ["2^n−1","2^(2^n)+1","n²+1","6n±1"], correct: 1 },
  { question: "Chinese remainder theorem deals with?", choices: ["Prime gaps","Systems of congruences","Quadratic residues","Continued fractions"], correct: 1 },
  { question: "Quadratic reciprocity is associated with?", choices: ["Euclid","Fibonacci","Gauss","Riemann"], correct: 2 },
  { question: "Riemann hypothesis concerns zeros of which function?", choices: ["Gamma","Zeta","Theta","Beta"], correct: 1 },
  { question: "a divides b is written?", choices: ["a|b","a∥b","a≡b","a⊕b"], correct: 0 },
  { question: "Bezout's identity: gcd(a,b) can be written as?", choices: ["a·b","a^b","ax+by","a+b"], correct: 2 },
  { question: "If p is prime and p | ab, then?", choices: ["p | a or p | b","p | a and p | b","p = a or p = b","p = ab"], correct: 0 },
  { question: "Number of divisors of 12?", choices: ["4","5","6","8"], correct: 2 },
  { question: "Sum of digits divisibility test works for?", choices: ["2","3","5","7"], correct: 1 },
  { question: "A number is divisible by 9 iff?", choices: ["Last digit is 9","Sum of digits divisible by 9","It is even","Last two digits divisible by 9"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NumberTheoryQuizSettings): NumberTheoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NumberTheoryQuizState, action: NumberTheoryQuizAction): NumberTheoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NumberTheoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
