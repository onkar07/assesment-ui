import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuizById } from "../utils/storage";

export default function ResultView() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    async function setValues(){
      const raw = sessionStorage.getItem("last_result_" + id);
    if (raw) setResult(JSON.parse(raw));
    const q = await getQuizById(id);
    if (q) setQuiz(q);
    }
    setValues
  }, [id]);

  if (!result || !quiz) {
    return (
      <div className="card">
        <div>No result found. Please take the quiz first.</div>
        <Link to={`/quiz/${id}`}><button>Take Quiz</button></Link>
      </div>
    );
  }

  const { answers, score, total, date } = result;

  return (
    <div>
      <h2>Result — {quiz.title}</h2>
      <div className="card">
        <div><strong>Score:</strong> {score} / {total}</div>
        <div className="small">Taken at: {new Date(date).toLocaleString()}</div>

        <hr />

        <h3>Answers</h3>
        {quiz.questions.map((q, i) => {
          const given = answers[q.id];
          let correct = false;
          if (q.type === "mcq") correct = String(given) === String(q.answer);
          else if (q.type === "tf") correct = String(given) === String(q.answer);
          else if (q.type === "text" && q.answer) correct = String(given || "").trim().toLowerCase() === String(q.answer||"").trim().toLowerCase();

          return (
            <div key={q.id} className="question">
              <div><strong>Q{i+1}:</strong> {q.text}</div>
              <div className={correct ? "result-correct" : "result-wrong"}>
                Given: {String(given ?? "(no answer)")}
              </div>
              <div className="small">Correct: {q.type === "mcq" ? (q.options[q.answer] ?? "(missing)") : q.answer ?? "(no answer set)"}</div>
            </div>
          );
        })}
        <div style={{marginTop:12}}>
          <Link to="/"><button>Back to quizzes</button></Link>
        </div>
      </div>
    </div>
  );
}
