// src/api.js
export const registerUser = async (userData) => {
  try {
    console.log("api.js → registerUser: sending", userData); // DEBUG
     const res = await fetch("http://localhost:5000/api/users/register",  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("api.js → registerUser: response status", res.status); // DEBUG

    // try parse JSON (safe)
    const data = await res.json().catch(() => ({}));
    console.log("api.js → registerUser: response data", data); // DEBUG

    return data;
  } catch (error) {
    console.error("api.js → registerUser: network error:", error);
    return { error: "Failed to fetch" };
  }
};

export const loginUser = async (userData) => {
  try {
    console.log("api.js → loginUser: sending", userData); // DEBUG
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("api.js → loginUser: response status", res.status); // DEBUG

    const data = await res.json().catch(() => ({}));
    console.log("api.js → loginUser: response data", data); // DEBUG

    return data;
  } catch (error) {
    console.error("api.js → loginUser: network error:", error);
    return { error: "Failed to fetch" };
  }
};

// ✅ add this at the end
export const getProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (err) {
    console.error("getProfile error:", err);
    return { error: "Failed to fetch profile" };
  }
};

// Fetch latest news articles
export const fetchLatestNews = async (limit = 20) => {
  try {
    const res = await fetch(`http://localhost:5000/api/news/latest?limit=${limit}`);
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (err) {
    console.error("fetchLatestNews error:", err);
    return { error: "Failed to fetch news" };
  }
};

// Fetch fresh news from NASA API
export const fetchFreshNews = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/news/fetch", {
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (err) {
    console.error("fetchFreshNews error:", err);
    return { error: "Failed to fetch fresh news" };
  }
};

// Simplify article content
export const simplifyArticle = async (articleId, mode) => {
  try {
    const res = await fetch(`http://localhost:5000/api/articles/${articleId}/simplify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode }),
    });
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (err) {
    console.error("simplifyArticle error:", err);
    return { error: "Failed to simplify article" };
  }
};

// Fetch NASA APOD (Astronomy Picture of the Day)
export const fetchNasaApod = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/nasa/apod");
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (err) {
    console.error("fetchNasaApod error:", err);
    return { error: "Failed to fetch NASA APOD" };
  }
};
