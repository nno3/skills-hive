#!/usr/bin/env python3
"""Write a static copy of the tester site for GitHub Pages."""

import json
import re
import shutil
from pathlib import Path

import preview_server as app

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / "docs"
BASE = "/skills-hive"

PAGE_FILES = {
    "/": "index.html",
    "/login": "login/index.html",
    "/register": "register/index.html",
    "/dashboard": "dashboard/index.html",
    "/course": "course/index.html",
    "/hexahive": "hexahive/index.html",
    "/friends": "friends/index.html",
    "/leaderboard": "leaderboard/index.html",
    "/leaderboard/friends": "leaderboard/friends/index.html",
    "/profile": "profile/index.html",
    "/profile/learning-history": "profile/learning-history/index.html",
    "/bookmarks": "bookmarks/index.html",
    "/forgot-password": "forgot-password/index.html",
}


def public_url(url):
    if not url.startswith("/") or url.startswith("//") or url.startswith(BASE + "/"):
        return url
    path, sep, query = url.partition("?")
    last = path.rstrip("/").split("/")[-1]
    if "." in last:
        return BASE + path + (("?" + query) if sep else "")
    if path in ("/", "/login", "/logout"):
        return BASE + "/"
    return BASE + path.rstrip("/") + "/"


def rewrite_html(html):
    html = re.sub(
        r'(href|src|action)="(/[^"]*)"',
        lambda match: f'{match.group(1)}="{public_url(match.group(2))}"',
        html,
    )
    html = html.replace(f'href="{BASE}/css/sidebar.css"', f'href="{BASE}/css/sidebar.css?v=4"')
    html = html.replace('src="photos/', f'src="{BASE}/photos/')
    html = html.replace("src='photos/", f"src='{BASE}/photos/")
    script = f'<script src="{BASE}/tester-static.js"></script>'
    if "<head>" in html:
        html = html.replace("<head>", "<head>" + script, 1)
    else:
        html = script + html
    return html


def patch_scripts():
    bookmark = (DOCS / "script" / "bookmark.js").read_text(encoding="utf-8")
    bookmark = bookmark.replace(
        "const currentPath = window.location.pathname;",
        'const currentPath = window.location.pathname.replace(/^\\/skills-hive/, "").replace(/\\/$/, "") || "/";',
    )
    bookmark = bookmark.replace(
        "window.location.href = '/bookmarks.html';",
        f"window.location.href = '{BASE}/bookmarks/';",
    )
    (DOCS / "script" / "bookmark.js").write_text(bookmark, encoding="utf-8")

    for name, old, new in (
        ("hexahive.js", "window.location.href = '/dashboard';", f"window.location.href = '{BASE}/dashboard/';"),
        ("course.js", 'window.location.href = "/dashboard";', f"window.location.href = '{BASE}/dashboard/';"),
        ("sidebar.js", 'let url = "/course";', f'let url = "{BASE}/course/";'),
        ("sidebar.js", 'a[href="/dashboard"]', f'a[href="{BASE}/dashboard/"]'),
        ("sidebar.js", 'a[href="/hexahive"]', f'a[href="{BASE}/hexahive/"]'),
    ):
        path = DOCS / "script" / name
        path.write_text(path.read_text(encoding="utf-8").replace(old, new), encoding="utf-8")


def initial_state():
    return {
        "courses": app.COURSES,
        "completions": app.COMPLETIONS,
        "inProgress": app.IN_PROGRESS,
        "people": app.PEOPLE,
        "badgeImg": app.BADGE_IMG,
        "bookmarks": sorted(app.STATE["bookmarks"]),
        "pending": app.STATE["pending"],
        "friends": list(app.STATE["friends"]),
        "nextId": app.STATE["next_id"],
        "extraReviews": {},
        "reviewSeq": 1000,
    }


TESTER_JS = r"""
(function () {
  const BASE = "/skills-hive";
  const KEY = "skillsHiveTester";
  const INITIAL = __INITIAL__;

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
"""


def export():
    if DOCS.exists():
        shutil.rmtree(DOCS)
    DOCS.mkdir()
    for name in ("css", "script", "photos"):
        shutil.copytree(app.STATIC / name, DOCS / name)
    patch_scripts()
    written = set()
    for route, relative in PAGE_FILES.items():
        target = DOCS / relative
        if target in written:
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        html = rewrite_html(app.render_page(route).decode("utf-8"))
        target.write_text(html, encoding="utf-8")
        written.add(target)
    script = TESTER_JS.replace("__INITIAL__", json.dumps(initial_state()))
    (DOCS / "tester-static.js").write_text(script, encoding="utf-8")
    (DOCS / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Wrote {len(written)} pages to {DOCS}")


if __name__ == "__main__":
    export()
