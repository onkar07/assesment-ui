import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById } from "../utils/storage";

function makeQid(q, quizId, index) {
  // Prefer a clientId (if frontend provided), then q.id, then server _id, else generate
  return q.clientId || q.id || q._id || `${quizId || "local"}-q-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TakeQuiz() {
  const { id } = useParams(); // id is server quiz id (_id)
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // map: qid -> answer (index / "True" / "text")

  useEffect(() => {
    async function load() {
      try {
        const q = await getQuizById(id);
        if (!q) {
          alert("Not found");
          navigate("/");
          return;
        }

        // normalize questions and add a stable __qid for client usage
        const normalizedQuestions = (q.questions || []).map((qq, i) => {
          const qid = makeQid(qq, q._id, i);
          return { ...qq, __qid: qid };
        });

        setQuiz({ ...q, questions: normalizedQuestions });
        // optionally clear previous answers
        setAnswers({});
        console.log("quiz : ", { ...q, questions: normalizedQuestions });
      } catch (e) {
        console.error(e);
        alert("Failed to load quiz");
        navigate("/");
      }
    }
    load();
  }, [id, navigate]);

  function setAnswer(qid, value) {
    // qid = the generated __qid; value = selected index or string
    console.log("setAnswer", qid, value);
    setAnswers(prev => ({ ...prev, [qid]: value }));
  }

  function submit() {
    if (!quiz) return;

    // Calculate score and store results in sessionStorage (or localStorage)
    const results = { quizId: quiz._id, date: new Date().toISOString(), answers };
    console.log("Results : ", results);

    // compute score
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      const given = answers[q.__qid];
      // q.answer shape: for mcq it's index (number), for tf it's "True"/"False", for text it's string (sample)
      if (q.type === "mcq") {
        // accept either number or string comparison
        if (given !== undefined && String(given) === String(q.answer)) correct++;
      } else if (q.type === "tf") {
        if (given !== undefined && String(given) === String(q.answer)) correct++;
      } else if (q.type === "text") {
        if (q.answer && given && String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) correct++;
      }
    });

    results.score = correct;
    results.total = quiz.questions.length;

    // store in session for ResultView (use quiz._id as key)
    sessionStorage.setItem("last_result_" + quiz._id, JSON.stringify(results));
    navigate(`/result/${quiz._id}`);
  }

  if (!quiz) return null;

  return (
    <div>
      <h2>{quiz.title}</h2>
      <div className="card">
        {quiz.questions.map((q, i) => (
          <div key={q.__qid} className="question">
            <div>
              <strong>Q{i + 1}:</strong> {q.text}
            </div>

            {q.type === "mcq" && (
              <div style={{ marginTop: 8 }}>
                {Array.isArray(q.options) && q.options.map((opt, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <label>
                      <input
                        type="radio"
                        name={q.__qid}
                        value={idx}
                        checked={String(answers[q.__qid]) === String(idx)}
                        onChange={() => setAnswer(q.__qid, idx)} // store index
                      />
                      {" "}{opt}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {q.type === "tf" && (
              <div style={{ marginTop: 8 }}>
                <label style={{ marginRight: 8 }}>
                  <input
                    type="radio"
                    name={q.__qid}
                    checked={answers[q.__qid] === "True"}
                    onChange={() => setAnswer(q.__qid, "True")}
                  />{" "}
                  True
                </label>
                <label>
                  <input
                    type="radio"
                    name={q.__qid}
                    checked={answers[q.__qid] === "False"}
                    onChange={() => setAnswer(q.__qid, "False")}
                  />{" "}
                  False
                </label>
              </div>
            )}

            {q.type === "text" && (
              <div className="field" style={{ marginTop: 8 }}>
                <input
                  placeholder="Your answer"
                  value={answers[q.__qid] || ""}
                  onChange={e => setAnswer(q.__qid, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <button onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  );
}
