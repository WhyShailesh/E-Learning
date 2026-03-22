import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 1, role: 'learner' }, "supersecret123", { expiresIn: "1h" });

async function run() {
  const payload = {
    quiz_id: 7, // whatever quiz
    answers: [ { option_id: '1' }, { option_id: '5' }, { option_id: '11' } ]
  };

  const res = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("API RESULT:", data);
}
run();
