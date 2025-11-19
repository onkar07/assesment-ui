// src/utils/storage.js
// Replaces localStorage wrapper with backend API calls.
// Expects an API root like: http://localhost:4000/api (set REACT_APP_API_URL or VITE_API_URL)

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000/api";

const QUIZZES_URL = `${API_BASE.replace(/\/$/, "")}/quizzes`;

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  // read body exactly once
  const text = await res.text();

  // try JSON if appropriate, otherwise return plain text
  let data;
  if (contentType.includes("application/json")) {
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // invalid json — fall back to raw text
      data = text;
    }
  } else {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && data.message) || data || res.statusText || "API error";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data;
}


/**
 * Get all quizzes
 * returns: Array<Quiz>
 */
export async function loadQuizzes() {
  const res = await fetch(QUIZZES_URL, { method: "GET", headers: { "Accept": "application/json" } });
  return handleResponse(res);
}

/**
 * SaveQuizzes (bulk replace) - optional.
 * If your backend doesn't support bulk replace this will create/update each item.
 * Use sparingly.
 */
export async function saveQuizzes(quizzes) {
  // If your server exposes a bulk endpoint (e.g. POST /quizzes/bulk) use that.
  // Default behavior here: attempt to replace by deleting all and re-creating is NOT implemented.
  // We'll attempt to upsert each quiz sequentially and return the saved list.
  const results = [];
  for (const q of quizzes) {
    const saved = await upsertQuiz(q);
    results.push(saved);
  }
  return results;
}

/**
 * Get quiz by id
 * id may be MongoDB _id or client id previously used
 */
export async function getQuizById(id) {
  if (!id) throw new Error("id required");
  const res = await fetch(`${QUIZZES_URL}/${encodeURIComponent(id)}`, { method: "GET", headers: { "Accept": "application/json" } });
  console.log("getQuizById : ",res)
  return handleResponse(res);
}

/**
 * Create a new quiz
 * quiz: { title, questions: [...] }
 */
export async function createQuiz(quiz) {
  const res = await fetch(QUIZZES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz)
  });
  return handleResponse(res);
}

/**
 * Update quiz by id
 * id: server-side id (Mongo _id)
 * quiz: updated payload
 */
export async function updateQuiz(id, quiz) {
  if (!id) throw new Error("id required for update");
  const res = await fetch(`${QUIZZES_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz)
  });
  return handleResponse(res);
}

/**
 * Upsert behavior preserved:
 * - If quiz has server-side _id (or id that the server recognizes) -> update
 * - Otherwise -> create
 *
 * The frontend prior used a numeric client id; server assigns its own _id.
 */
export async function upsertQuiz(quiz) {
  // Prefer server-side id fields: _id, id
  const serverId = quiz && (quiz._id || quiz.id);
  // If the quiz was created locally and has only client-side id, we still create on server
  if (serverId && String(serverId).length > 6) {
    // assume server id (Mongo _id) - attempt update
    try {
      return await updateQuiz(serverId, quiz);
    } catch (err) {
      // fallback to create if update failed (e.g., invalid id)
      return createQuiz(quiz);
    }
  }
  // create new
  return createQuiz(quiz);
}

/**
 * Delete quiz by id
 */
export async function deleteQuiz(id) {
  if (!id) throw new Error("id required");
  const res = await fetch(`${QUIZZES_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  return "Deleted";
}
