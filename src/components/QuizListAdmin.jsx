import React from "react";
import { loadQuizzes, deleteQuiz } from "../utils/storage";

export default function QuizListAdmin({ quizzes = [], onEdit, onDelete }) {
  // quizzes passed from parent; delete calls parent so it persists
  return (
    <div className="card">
      <h3>All Quizzes</h3>
      {quizzes.length === 0 && <div className="small">No quizzes yet.</div>}
      <ul>
        {quizzes.map(q => (
          <li key={q.id} style={{marginBottom:10}}>
            <strong>{q.title}</strong> <span className="small">({q.questions.length} qs)</span>
            <div style={{marginTop:6}}>
              <button onClick={() => onEdit(q)}>Edit</button>
              <button onClick={() => { if(window.confirm("Delete quiz?")) onDelete(q.id); }} className="btn-danger">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
