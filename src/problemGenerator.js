const LEVEL_MULTIPLIER = { below: 0.5, average: 1, good: 1.5, excellent: 2 };

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scale(base, multiplier) {
  return Math.max(1, Math.round(base * multiplier));
}

export function generateProblem(grade, level) {
  const m = LEVEL_MULTIPLIER[level];

  // Grade 1-2: addition and subtraction with small numbers
  // Grade 3-4: multiplication and division introduced
  // Grade 5-6: larger numbers, all operations

  const ops = grade <= 2
    ? ['+', '-']
    : grade <= 4
    ? ['+', '-', '×', '÷']
    : ['+', '-', '×', '÷'];

  const op = ops[randInt(0, ops.length - 1)];

  let a, b, answer, question;

  if (op === '+') {
    const max = scale(grade <= 2 ? 10 : grade <= 4 ? 50 : 200, m);
    a = randInt(1, max);
    b = randInt(1, max);
    answer = a + b;
    question = `${a} + ${b}`;
  } else if (op === '-') {
    const max = scale(grade <= 2 ? 10 : grade <= 4 ? 50 : 200, m);
    a = randInt(1, max);
    b = randInt(1, a);
    answer = a - b;
    question = `${a} - ${b}`;
  } else if (op === '×') {
    const max = scale(grade <= 4 ? 10 : 20, m);
    a = randInt(2, max);
    b = randInt(2, max);
    answer = a * b;
    question = `${a} × ${b}`;
  } else {
    // division — always whole number result
    const max = scale(grade <= 4 ? 10 : 20, m);
    b = randInt(2, max);
    answer = randInt(1, max);
    a = b * answer;
    question = `${a} ÷ ${b}`;
  }

  return { question, answer };
}
