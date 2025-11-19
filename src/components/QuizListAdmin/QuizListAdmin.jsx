import React from "react";

export default function QuizListAdmin({ quizzes = [], onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>All Quizzes</h3>
      {quizzes.length === 0 && <div className="small">No quizzes yet.</div>}
      <ul>
        {quizzes.map(q => (
          <li key={q._id} style={{ marginBottom: 10 }}>
            <strong>{q.title}</strong>
            <span className="small"> ({q.questions?.length || 0} qs)</span>

            <div style={{ marginTop: 6 }}>
              <button onClick={() => onEdit(q)}>Edit</button>

              <button
                onClick={() => {
                  if (window.confirm("Delete quiz?")) onDelete(q._id);
                }}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
