
(function () {
  const BASE = "/skills-hive";
  const KEY = "skillsHiveTester";
  const INITIAL = {"courses": [{"id": 1, "title": "Artificial Intelligence Fundamentals", "description": "Learn the basics of Artificial Intelligence.", "category": "AI", "level": "Beginner", "thumbnail": "/photos/AI.jpg", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-7913EE1DB030"}, {"id": 2, "title": "Machine Learning with Python", "description": "Learn Machine Learning using Python.", "category": "AI", "level": "Intermediate", "thumbnail": "/photos/mL_2.avif", "url": "https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:BDU+ML0101EN+V4"}, {"id": 3, "title": "Natural Language Processing and Computer Vision", "description": "Introduction to NLP techniques and Computer Vision.", "category": "AI", "level": "Intermediate", "thumbnail": "/photos/NLP.jpg", "url": "https://skills.yourlearning.ibm.com/activity/MDL-214"}, {"id": 5, "title": "Machine Learning and Deep Learning", "description": "Explore the logic behind how computers learn.", "category": "AI", "level": "Advanced", "thumbnail": "/photos/reinforcement.jpg", "url": "https://skills.yourlearning.ibm.com/activity/MDL-212"}, {"id": 6, "title": "Data Science Fundamentals", "description": "Master the fundamentals of Data Science.", "category": "Data Science", "level": "Beginner", "thumbnail": "/photos/data.avif", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-BC0FAEE8E439"}, {"id": 7, "title": "Advanced Google Analytics", "description": "Learn how data gets collected and turned into reports.", "category": "Data Science", "level": "Advanced", "thumbnail": "/photos/Advanced_dataAnalysis.jpg", "url": "https://skills.yourlearning.ibm.com/activity/URL-E74983239450"}, {"id": 9, "title": "Data Visualization with R", "description": "Learn how to visualize data effectively.", "category": "Data Science", "level": "Intermediate", "thumbnail": "/photos/data3.jpg", "url": "https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:COGNITIVECLASS+DV0151EN+V1"}, {"id": 11, "title": "An Introduction to Cloud Computing", "description": "Understand the basics of Cloud Computing.", "category": "Cloud Computing", "level": "Beginner", "thumbnail": "/photos/CC_15.jpg", "url": "https://skills.yourlearning.ibm.com/activity/ILB-KXWDNYZPPMZV1QPP"}, {"id": 15, "title": "Cloud Security", "description": "Learn the basics of Cloud Security.", "category": "Cloud Computing", "level": "Intermediate", "thumbnail": "/photos/K_20.avif", "url": "https://skills.yourlearning.ibm.com/activity/URL-JI8IKPJICSM"}, {"id": 16, "title": "Cybersecurity Fundamentals", "description": "Learn the basics of cybersecurity.", "category": "Cybersecurity", "level": "Beginner", "thumbnail": "/photos/Cyber.jpg", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-FA511CDFAF48"}, {"id": 17, "title": "Cyber Investigator", "description": "An interactive cybersecurity experience.", "category": "Cybersecurity", "level": "Intermediate", "thumbnail": "/photos/Cyber2.jpg", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-A273AA80C96E"}, {"id": 19, "title": "Cybersecurity for Businesses", "description": "Learn how to secure business systems.", "category": "Cybersecurity", "level": "Advanced", "thumbnail": "/photos/Ai_bussiness.jpg", "url": "https://skills.yourlearning.ibm.com/activity/URL-DK-ZQQ-BFY4"}], "completions": [{"courseId": 1, "completionTime": "2026-10-02T14:30:00", "startTime": "2026-09-20T10:00:00", "durationHours": 6, "durationMinutes": 0}, {"courseId": 16, "completionTime": "2026-10-18T11:15:00", "startTime": "2026-10-01T09:00:00", "durationHours": 5, "durationMinutes": 0}, {"courseId": 11, "completionTime": "2026-11-01T16:00:00", "startTime": "2026-10-22T13:00:00", "durationHours": 7, "durationMinutes": 0}, {"courseId": 6, "completionTime": "2026-11-06T18:40:00", "startTime": "2026-10-28T09:10:00", "durationHours": 7, "durationMinutes": 0}], "inProgress": [{"courseId": 2, "startTime": "2026-11-08T15:20:00"}, {"courseId": 17, "startTime": "2026-11-10T09:05:00"}], "people": {"amira": {"bio": "Working through the data science path.", "hours": 31, "score": 1800, "badges": ["SILVER", "BRONZE"]}, "leila": {"bio": "Cloud and security, in that order.", "hours": 40, "score": 3200, "badges": ["GOLD", "SILVER"]}, "james": {"bio": "Just started the AI courses.", "hours": 18, "score": 900, "badges": ["BRONZE"]}, "omar": {"bio": "Here for the cybersecurity labs.", "hours": 12, "score": 640, "badges": ["BRONZE"]}}, "badgeImg": {"BRONZE": "/photos/bronze-badge.png", "SILVER": "/photos/silver-badge.png", "GOLD": "/photos/gold-badge.png"}, "bookmarks": [1, 6], "pending": [{"id": 1, "username": "james"}], "friends": ["amira", "leila"], "nextId": 2, "extraReviews": {}, "reviewSeq": 1000};

  function loadState() {
    const saved = sessionStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
    sessionStorage.setItem(KEY, JSON.stringify(INITIAL));
    return JSON.parse(JSON.stringify(INITIAL));
  }

  function saveState(state) {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  }

  function courseJson(course) {
    const thumbnail = course.thumbnail.startsWith("/photos/") ? BASE + course.thumbnail : course.thumbnail;
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: thumbnail,
      url: course.url,
      category: { name: course.category },
      level: { name: course.level }
    };
  }

  function reviewsFor(state, courseId) {
    const course = state.courses.find((item) => item.id === courseId);
    const title = course ? course.title : "this course";
    const sample = [
      { id: courseId * 10 + 1, username: "amira", rating: 5, comment: "Clear and practical. " + title + " was a good place to start.", date: "2026-10-12" },
      { id: courseId * 10 + 2, username: "leila", rating: 4, comment: "Useful examples, and the exercises match the lessons.", date: "2026-11-02" }
    ];
    return (state.extraReviews[courseId] || []).concat(sample);
  }

  function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  function textResponse(text, status) {
    return new Response(text, {
      status: status || 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  function readBody(init) {
    if (!init || !init.body) return {};
    try {
      return JSON.parse(init.body);
    } catch (error) {
      return Object.fromEntries(new URLSearchParams(String(init.body)));
    }
  }

  function mock(path, method, query, init) {
    const state = loadState();
    if (path === "/api/courses/search-and-filter" && method === "GET") {
      const text = (query.get("query") || "").toLowerCase();
      const category = query.get("category") || "";
      const level = query.get("level") || "";
      const found = state.courses.filter((course) => {
        if (text && !course.title.toLowerCase().includes(text) && !course.description.toLowerCase().includes(text)) return false;
        if (category && course.category !== category) return false;
        if (level && course.level !== level) return false;
        return true;
      }).map(courseJson);
      return jsonResponse(found);
    }
    let match = path.match(/^\/api\/courses\/(\d+)$/);
    if (match && method === "GET") {
      const course = state.courses.find((item) => item.id === Number(match[1]));
      return course ? jsonResponse(courseJson(course)) : jsonResponse({ error: "not found" }, 404);
    }
    match = path.match(/^\/api\/courses\/(\d+)\/reviews$/);
    if (match && method === "GET") return jsonResponse(reviewsFor(state, Number(match[1])));
    if (match && method === "POST") {
      const data = readBody(init);
      state.reviewSeq += 1;
      const review = {
        id: state.reviewSeq,
        username: "tester",
        rating: Number(data.rating || 5),
        comment: data.comment || "Completed this course.",
        date: "2026-11-12"
      };
      const courseId = Number(match[1]);
      state.extraReviews[courseId] = [review].concat(state.extraReviews[courseId] || []);
      saveState(state);
      return jsonResponse(review);
    }
    match = path.match(/^\/api\/courses\/(\d+)\/reviews\/count$/);
    if (match && method === "GET") return jsonResponse(reviewsFor(state, Number(match[1])).length);
    if (path === "/api/course-completion/my" && method === "GET") return jsonResponse(state.completions);
    if (path === "/api/course-completion" && method === "POST") {
      const data = readBody(init);
      const courseId = Number(data.courseId || 0);
      state.completions.unshift({
        courseId: courseId,
        startTime: data.startTime || "2026-11-01T10:00:00",
        completionTime: data.completionTime || "2026-11-12T15:00:00",
        durationHours: Number(data.durationHours || 0),
        durationMinutes: Number(data.durationMinutes || 0)
      });
      state.inProgress = state.inProgress.filter((row) => row.courseId !== courseId);
      saveState(state);
      return jsonResponse(state.completions);
    }
    if (path === "/api/course-in-progress/my" && method === "GET") return jsonResponse(state.inProgress);
    match = path.match(/^\/api\/course-in-progress\/get\/(\d+)$/);
    if (match && method === "GET") {
      const courseId = Number(match[1]);
      const row = state.inProgress.find((item) => item.courseId === courseId);
      return jsonResponse(row || { courseId: courseId, startTime: "2026-11-01T10:00:00" });
    }
    match = path.match(/^\/api\/course-in-progress\/(\d+)$/);
    if (match && method === "DELETE") {
      const courseId = Number(match[1]);
      state.inProgress = state.inProgress.filter((row) => row.courseId !== courseId);
      saveState(state);
      return jsonResponse({ removed: courseId });
    }
    if (match && method === "POST") {
      const courseId = Number(match[1]);
      let row = state.inProgress.find((item) => item.courseId === courseId);
      if (!row) {
        row = { courseId: courseId, startTime: "2026-11-12T15:00:00" };
        state.inProgress.unshift(row);
        saveState(state);
      }
      return jsonResponse(row);
    }
    if (path === "/hexahive/score" && method === "GET") return jsonResponse({ highScore: 2400 });
    if (path === "/hexahive/score" && method === "POST") return textResponse("saved");
    if (path === "/get-bookmarks-preview" && method === "GET") {
      const items = state.bookmarks.map((id) => {
        const course = state.courses.find((item) => item.id === id);
        return course ? { course: courseJson(course) } : null;
      }).filter(Boolean);
      return jsonResponse(items);
    }
    if (path === "/check-bookmark" && method === "GET") {
      return textResponse(state.bookmarks.includes(Number(query.get("courseId") || 0)) ? "true" : "false");
    }
    if (path === "/toggle-bookmark" && method === "POST") {
      const data = readBody(init);
      const courseId = Number(data.courseId || 0);
      const index = state.bookmarks.indexOf(courseId);
      if (index >= 0) {
        state.bookmarks.splice(index, 1);
        saveState(state);
        return textResponse("removed");
      }
      if (state.courses.some((course) => course.id === courseId)) state.bookmarks.push(courseId);
      saveState(state);
      return textResponse("added");
    }
    if (path === "/friends/search" && method === "GET") {
      const text = (query.get("query") || "").toLowerCase();
      const names = Object.keys(state.people).filter((name) => text && name.includes(text) && !state.friends.includes(name));
      return jsonResponse(names.map((name) => ({ username: name })));
    }
    match = path.match(/^\/friends\/summary\/([^/]+)$/);
    if (match && method === "GET") {
      const person = state.people[decodeURIComponent(match[1])];
      if (!person) return jsonResponse({}, 404);
      return jsonResponse({
        bio: person.bio,
        totalHours: person.hours,
        highestScore: person.score,
        badges: person.badges.map((kind) => ({
          type: kind,
          imagePath: BASE + state.badgeImg[kind],
          earnedAt: "2026-10-02T12:00:00"
        }))
      });
    }
    if (path === "/friends/request" && method === "POST") {
      const data = readBody(init);
      const name = String(data.recipientUsername || "").toLowerCase();
      if (!state.people[name]) return textResponse("No user found with that name. Try amira, james, leila, or omar.", 400);
      if (state.friends.includes(name) || state.pending.some((item) => item.username === name)) {
        return textResponse(name + " is already on your friends list.");
      }
      state.pending.push({ id: state.nextId, username: name });
      state.nextId += 1;
      saveState(state);
      return textResponse("Friend request sent to " + name + ".");
    }
    match = path.match(/^\/friends\/accept\/(\d+)$/);
    if (match && method === "POST") {
      const requestId = Number(match[1]);
      const kept = [];
      state.pending.forEach((item) => {
        if (item.id === requestId) {
          if (!state.friends.includes(item.username)) state.friends.push(item.username);
        } else {
          kept.push(item);
        }
      });
      state.pending = kept;
      saveState(state);
      return textResponse("accepted");
    }
    match = path.match(/^\/friends\/decline\/(\d+)$/);
    if (match && method === "POST") {
      const requestId = Number(match[1]);
      state.pending = state.pending.filter((item) => item.id !== requestId);
      saveState(state);
      return textResponse("declined");
    }
    match = path.match(/^\/friends\/remove\/([^/]+)$/);
    if (match && method === "POST") {
      const name = decodeURIComponent(match[1]);
      state.friends = state.friends.filter((friend) => friend !== name);
      saveState(state);
      return textResponse("removed");
    }
    return null;
  }

  document.addEventListener("submit", function (event) {
    const form = event.target;
    if (!form || !form.getAttribute) return;
    if (form.querySelector("#username")) {
      event.preventDefault();
      window.location.href = BASE + "/dashboard/";
    } else if (form.querySelector(".fa-sign-out-alt")) {
      event.preventDefault();
      window.location.href = BASE + "/";
    }
  }, true);

  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    let path = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
    path = path.replace(/^\/skills-hive/, "");
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    const query = new URLSearchParams((url.split("?")[1] || "").split("#")[0]);
    const method = ((init && init.method) || "GET").toUpperCase();
    const mocked = mock(path, method, query, init);
    if (mocked) return Promise.resolve(mocked);
    if (typeof input === "string" && input.startsWith("/") && !input.startsWith(BASE)) {
      return originalFetch(BASE + input, init);
    }
    return originalFetch(input, init);
  };
})();
