import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadQuizzes } from "../utils/storage";
import envConfig from "../config/envConfig";
export default function QuizTakeList() {
  const [quizzes, setQuizzes] = useState([]);

useEffect(() => {
  async function fetchQuizzes() {
    const data = await loadQuizzes();
    setQuizzes(data);
  }

  fetchQuizzes();
}, []);

  return (
    <div>
      <h2>Available Quizzes</h2>
      <div className="card">
        {quizzes.length === 0 && <div className="small">No quizzes available. Admin can create quizzes at {envConfig.ADMIN_PATH || "/admin"}</div>}
        <ul>
          {quizzes.map(q => (
            <li key={q._id} style={{marginBottom:10}}>
              <strong>{q.title}</strong> <span className="small">({q.questions.length} questions)</span>
              <div style={{marginTop:6}}>
                <Link to={`/quiz/${q._id}`}><button>Take Quiz</button></Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
