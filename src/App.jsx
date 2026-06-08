import { useState, useRef, useEffect } from 'react';
import { generateProblem } from './problemGenerator';
import './App.css';

const GRADES = [1, 2, 3, 4, 5, 6];
const LEVELS = [
  { value: 'below', label: 'Below Average' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
];

function Setup({ onStart }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [level, setLevel] = useState('');

  const valid = name.trim() && grade && level;

  return (
    <div className="card setup">
      <h1>Math Quiz</h1>
      <p className="subtitle">Let&apos;s see what you&apos;ve got!</p>

      <label>
        Your name
        <input
          type="text"
          placeholder="e.g. Gali"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </label>

      <label>
        School year (grade)
        <div className="grade-buttons">
          {GRADES.map(g => (
            <button
              key={g}
              className={`grade-btn ${grade === g ? 'selected' : ''}`}
              onClick={() => setGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </label>

      <label>
        Your level
        <div className="level-buttons">
          {LEVELS.map(l => (
            <button
              key={l.value}
              className={`level-btn ${level === l.value ? 'selected' : ''}`}
              onClick={() => setLevel(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </label>

      <button
        className="start-btn"
        disabled={!valid}
        onClick={() => onStart({ name: name.trim(), grade, level })}
      >
        Start Quiz!
      </button>
    </div>
  );
}

function Quiz({ profile, onRestart }) {
  const [problem, setProblem] = useState(() => generateProblem(profile.grade, profile.level));
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    if (feedback === null) inputRef.current?.focus();
  }, [feedback, problem]);

  function submit() {
    if (input.trim() === '') return;
    const userAnswer = parseInt(input.trim(), 10);
    const isCorrect = userAnswer === problem.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setProblem(generateProblem(profile.grade, profile.level));
    setInput('');
    setFeedback(null);
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      if (feedback === null) submit();
      else next();
    }
  }

  return (
    <div className="card quiz">
      <div className="quiz-header">
        <span className="greeting">Hi {profile.name}!</span>
        <span className="score">{score.correct} / {score.total}</span>
      </div>

      <div className="problem">{problem.question} = ?</div>

      {feedback === null ? (
        <div className="answer-row">
          <input
            ref={inputRef}
            type="number"
            className="answer-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Your answer"
          />
          <button className="submit-btn" onClick={submit} disabled={input.trim() === ''}>
            Check
          </button>
        </div>
      ) : (
        <div className={`feedback ${feedback}`}>
          {feedback === 'correct' ? (
            <span>Correct! Well done 🎉</span>
          ) : (
            <span>Not quite — the answer was <strong>{problem.answer}</strong></span>
          )}
          <button className="next-btn" onClick={next}>Next →</button>
        </div>
      )}

      <button className="restart-link" onClick={onRestart}>Change settings</button>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  return profile ? (
    <Quiz profile={profile} onRestart={() => setProfile(null)} />
  ) : (
    <Setup onStart={setProfile} />
  );
}
