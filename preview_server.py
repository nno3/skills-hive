#!/usr/bin/env python3
"""Local preview for Skills Hive when Java is not available.

Serves the Thymeleaf pages with a filled tester account: sample courses,
friends, badges, bookmarks, and HexaHive scores. No database and no secrets.
"""

import json
import re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
TEMPLATES = ROOT / "src" / "main" / "resources" / "Templates"
STATIC = ROOT / "src" / "main" / "resources" / "static"
HOST = "127.0.0.1"
PORT = 8895

COURSES = [
    {"id": 1, "title": "Artificial Intelligence Fundamentals", "description": "Learn the basics of Artificial Intelligence.", "category": "AI", "level": "Beginner", "thumbnail": "/photos/AI.jpg", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-7913EE1DB030"},
    {"id": 2, "title": "Machine Learning with Python", "description": "Learn Machine Learning using Python.", "category": "AI", "level": "Intermediate", "thumbnail": "/photos/mL_2.avif", "url": "https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:BDU+ML0101EN+V4"},
    {"id": 3, "title": "Natural Language Processing and Computer Vision", "description": "Introduction to NLP techniques and Computer Vision.", "category": "AI", "level": "Intermediate", "thumbnail": "/photos/NLP.jpg", "url": "https://skills.yourlearning.ibm.com/activity/MDL-214"},
    {"id": 5, "title": "Machine Learning and Deep Learning", "description": "Explore the logic behind how computers learn.", "category": "AI", "level": "Advanced", "thumbnail": "/photos/reinforcement.jpg", "url": "https://skills.yourlearning.ibm.com/activity/MDL-212"},
    {"id": 6, "title": "Data Science Fundamentals", "description": "Master the fundamentals of Data Science.", "category": "Data Science", "level": "Beginner", "thumbnail": "/photos/data.avif", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-BC0FAEE8E439"},
    {"id": 7, "title": "Advanced Google Analytics", "description": "Learn how data gets collected and turned into reports.", "category": "Data Science", "level": "Advanced", "thumbnail": "/photos/Advanced_dataAnalysis.jpg", "url": "https://skills.yourlearning.ibm.com/activity/URL-E74983239450"},
    {"id": 9, "title": "Data Visualization with R", "description": "Learn how to visualize data effectively.", "category": "Data Science", "level": "Intermediate", "thumbnail": "/photos/data3.jpg", "url": "https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:COGNITIVECLASS+DV0151EN+V1"},
    {"id": 11, "title": "An Introduction to Cloud Computing", "description": "Understand the basics of Cloud Computing.", "category": "Cloud Computing", "level": "Beginner", "thumbnail": "/photos/CC_15.jpg", "url": "https://skills.yourlearning.ibm.com/activity/ILB-KXWDNYZPPMZV1QPP"},
    {"id": 15, "title": "Cloud Security", "description": "Learn the basics of Cloud Security.", "category": "Cloud Computing", "level": "Intermediate", "thumbnail": "/photos/K_20.avif", "url": "https://skills.yourlearning.ibm.com/activity/URL-JI8IKPJICSM"},
    {"id": 16, "title": "Cybersecurity Fundamentals", "description": "Learn the basics of cybersecurity.", "category": "Cybersecurity", "level": "Beginner", "thumbnail": "/photos/Cyber.jpg", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-FA511CDFAF48"},
    {"id": 17, "title": "Cyber Investigator", "description": "An interactive cybersecurity experience.", "category": "Cybersecurity", "level": "Intermediate", "thumbnail": "/photos/Cyber2.jpg", "url": "https://skills.yourlearning.ibm.com/activity/PLAN-A273AA80C96E"},
    {"id": 19, "title": "Cybersecurity for Businesses", "description": "Learn how to secure business systems.", "category": "Cybersecurity", "level": "Advanced", "thumbnail": "/photos/Ai_bussiness.jpg", "url": "https://skills.yourlearning.ibm.com/activity/URL-DK-ZQQ-BFY4"},
]
BY_ID = {c["id"]: c for c in COURSES}

COMPLETIONS = [
    {"courseId": 1, "completionTime": "2026-10-02T14:30:00", "startTime": "2026-09-20T10:00:00", "durationHours": 6, "durationMinutes": 0},
    {"courseId": 16, "completionTime": "2026-10-18T11:15:00", "startTime": "2026-10-01T09:00:00", "durationHours": 5, "durationMinutes": 0},
    {"courseId": 11, "completionTime": "2026-11-01T16:00:00", "startTime": "2026-10-22T13:00:00", "durationHours": 7, "durationMinutes": 0},
    {"courseId": 6, "completionTime": "2026-11-06T18:40:00", "startTime": "2026-10-28T09:10:00", "durationHours": 7, "durationMinutes": 0},
]
IN_PROGRESS = [
    {"courseId": 2, "startTime": "2026-11-08T15:20:00"},
    {"courseId": 17, "startTime": "2026-11-10T09:05:00"},
]

PEOPLE = {
    "amira": {"bio": "Working through the data science path.", "hours": 31, "score": 1800, "badges": ["SILVER", "BRONZE"]},
    "leila": {"bio": "Cloud and security, in that order.", "hours": 40, "score": 3200, "badges": ["GOLD", "SILVER"]},
    "james": {"bio": "Just started the AI courses.", "hours": 18, "score": 900, "badges": ["BRONZE"]},
    "omar": {"bio": "Here for the cybersecurity labs.", "hours": 12, "score": 640, "badges": ["BRONZE"]},
}
BADGE_IMG = {
    "BRONZE": "/photos/bronze-badge.png",
    "SILVER": "/photos/silver-badge.png",
    "GOLD": "/photos/gold-badge.png",
}

STATE = {
    "bookmarks": {1, 6},
    "pending": [{"id": 1, "username": "james"}],
    "friends": ["amira", "leila"],
    "next_id": 2,
    "extra_reviews": {},
    "review_seq": 1000,
}

PAGES = {
    "/": "login.html",
    "/login": "login.html",
    "/register": "register.html",
    "/dashboard": "dashboard.html",
    "/course": "course.html",
    "/hexahive": "game/hexahive.html",
    "/friends": "friends.html",
    "/leaderboard": "leaderboard.html",
    "/leaderboard/friends": "leaderboard.html",
    "/profile": "profile-home.html",
    "/profile/learning-history": "learning-history.html",
    "/bookmarks": "bookmarks.html",
    "/bookmarks.html": "bookmarks.html",
    "/forgot-password": "forgot-password.html",
}

BANNER = """
<style>
#tester-banner{position:sticky;top:0;z-index:10000;background:#3d3200;color:#fff8dc;text-align:center;padding:10px 16px;font-family:Poppins,sans-serif;font-size:14px;line-height:1.4}
#tester-banner strong{color:#FFD700}
</style>
<div id="tester-banner"><strong>Tester account.</strong> This is sample data, so you can look around without registering.</div>
"""


def course_json(course):
    return {
        "id": course["id"],
        "title": course["title"],
        "description": course["description"],
        "thumbnail": course["thumbnail"],
        "url": course["url"],
        "category": {"name": course["category"]},
        "level": {"name": course["level"]},
    }


def reviews_for(course_id):
    title = BY_ID.get(course_id, {}).get("title", "this course")
    sample = [
        {"id": course_id * 10 + 1, "username": "amira", "rating": 5, "comment": f"Clear and practical. {title} was a good place to start.", "date": "2026-10-12"},
        {"id": course_id * 10 + 2, "username": "leila", "rating": 4, "comment": "Useful examples, and the exercises match the lessons.", "date": "2026-11-02"},
    ]
    return STATE["extra_reviews"].get(course_id, []) + sample


def read_json(raw):
    if not raw:
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def esc(text):
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;"))


def dashboard_card(course):
    level = course["level"].lower()
    return f"""
<div class="course-card" data-course-id="{course['id']}">
  <img src="{course['thumbnail']}" alt="Course Thumbnail">
  <div class="course-details">
    <div class="course-content">
      <h3>{esc(course['title'])}</h3>
      <p>{esc(course['description'])}</p>
      <div class="course-meta">
        <span class="course-category">{esc(course['category'])}</span>
        <span class="course-level {level}">{esc(course['level'])}</span>
      </div>
    </div>
    <a href="#" data-course-id="{course['id']}" class="reviews-btn"><span class="review-count">2 Reviews</span></a>
    <a href="{course['url']}" class="start-learning-button" target="_blank" rel="noopener">Start Learning</a>
    <button type="button" onclick="toggleBookmark(this)" data-course-id="{course['id']}" class="bookmark-btn"><i class="far fa-bookmark"></i></button>
  </div>
</div>
"""


def cards_for(ids):
    return "".join(dashboard_card(BY_ID[i]) for i in ids)


def strip_marked(html, marker):
    """Remove each element whose opening tag contains marker."""
    out = []
    i = 0
    while True:
        start = html.find(marker, i)
        if start == -1:
            out.append(html[i:])
            break
        tag_start = html.rfind("<", 0, start)
        match = re.match(r"<([A-Za-z0-9]+)", html[tag_start:])
        if not match:
            out.append(html[i:start + len(marker)])
            i = start + len(marker)
            continue
        tag = match.group(1)
        open_end = html.find(">", start)
        out.append(html[i:tag_start])
        if open_end > 0 and html[open_end - 1] == "/":
            i = open_end + 1
            continue
        depth = 1
        pos = open_end + 1
        open_re = re.compile(rf"<{tag}(\s|/?>)")
        close_re = re.compile(rf"</{tag}\s*>", re.I)
        while depth > 0 and pos < len(html):
            next_open = open_re.search(html, pos)
            next_close = close_re.search(html, pos)
            if not next_close:
                pos = len(html)
                break
            if next_open and next_open.start() < next_close.start():
                gt = html.find(">", next_open.start())
                if gt != -1 and html[gt - 1] == "/":
                    pos = gt + 1
                    continue
                depth += 1
                pos = next_open.end()
            else:
                depth -= 1
                pos = next_close.end()
        i = pos
    return "".join(out)


def rewrite_th(html):
    html = re.sub(
        r'th:(src|href|action)="@\{([^}]+)\}"',
        lambda m: f'{m.group(1)}="{m.group(2)}"',
        html,
    )
    html = strip_marked(html, 'th:if="${errorMessage')
    html = strip_marked(html, 'th:if="${successMessage')
    html = strip_marked(html, 'th:if="${infoMessage')
    html = strip_marked(html, "th:each")
    return html


def inject_banner(html):
    if "<body>" in html:
        return html.replace("<body>", "<body>" + BANNER, 1)
    return BANNER + html


def fill_dashboard(html):
    html = html.replace('th:text="${username}">Username', ">Tester", 1)
    html = html.replace(
        '<div class="badges-list">',
        '<div class="badges-list">' + """
<div class="badge-card">
  <img src="/photos/bronze-badge.png" alt="Bronze badge">
  <div class="badge-details"><h3>BRONZE</h3><p>Earned on: <span>02 Oct 2026</span></p></div>
</div>
""",
        1,
    )
    chunks = html.split('<div class="course-scroll">')
    groups = [
        cards_for([1, 16, 6]),
        cards_for([2, 3, 9, 15]),
        cards_for([5, 7, 19]),
    ]
    if len(chunks) == 4:
        html = chunks[0]
        for cards, rest in zip(groups, chunks[1:]):
            html += '<div class="course-scroll">' + cards + rest
    return html


def fill_course(html):
    html = html.replace(
        '<option value="">All Categories</option>',
        '<option value="">All Categories</option>'
        '<option value="AI">AI</option>'
        '<option value="Data Science">Data Science</option>'
        '<option value="Cloud Computing">Cloud Computing</option>'
        '<option value="Cybersecurity">Cybersecurity</option>',
        1,
    )
    html = html.replace(
        '<option value="">All Levels</option>',
        '<option value="">All Levels</option>'
        '<option value="Beginner">Beginner</option>'
        '<option value="Intermediate">Intermediate</option>'
        '<option value="Advanced">Advanced</option>',
        1,
    )
    return html


def fill_hexahive(html):
    html = html.replace('th:text="${totalHours}">0', ">25", 1)
    html = html.replace('th:text="${highestLevel}">1', ">3", 1)
    html = html.replace('th:text="${highestScore}">0', ">2400", 1)
    levels = [
        ("1", "Beginner (0-10 hours)", True),
        ("2", "Intermediate (10-20 hours)", True),
        ("3", "Advanced (20-30 hours)", True),
        ("4", "Expert (30+ hours)", False),
    ]
    cards = []
    for number, label, unlocked in levels:
        if unlocked:
            action = f'<button type="button" onclick="startGame({number})">Play Level</button>'
        else:
            action = '<div class="locked-message">Complete more courses to unlock!</div>'
        state = "unlocked" if unlocked else "locked"
        cards.append(
            f'<div class="level-card {state}"><h3>Level {number}</h3><p>{label}</p>{action}</div>'
        )
    html = html.replace('<div class="level-grid">', '<div class="level-grid">' + "".join(cards), 1)
    return html


def fill_friends(html):
    if STATE["pending"]:
        cards = []
        for request in STATE["pending"]:
            cards.append(
                f"""<div class="friend-request-card"><p>{esc(request['username'])}</p>
                <div class="friend-request-actions">
                <button type="button" onclick="acceptFriend({request['id']})">Accept</button>
                <button type="button" onclick="declineFriend({request['id']})">Decline</button>
                </div></div>"""
            )
        html = strip_marked(html, "#lists.isEmpty(pendingRequests)")
        html = html.replace("<h2>Pending Friend Requests</h2>", "<h2>Pending Friend Requests</h2>" + "".join(cards), 1)
    if STATE["friends"]:
        cards = []
        for name in STATE["friends"]:
            cards.append(
                f"""<div class="friend-card">
                <span class="bee-button" onclick="showFriendSummary('{esc(name)}')">🐝</span>
                <p>{esc(name)}</p>
                <button type="button" class="remove-friend-btn" onclick="removeFriend('{esc(name)}')">Remove</button>
                </div>"""
            )
        html = strip_marked(html, "#lists.isEmpty(friends)")
        html = html.replace(
            '<div id="friend-cards-container">',
            '<div id="friend-cards-container">' + "".join(cards),
            1,
        )
    return html


def fill_leaderboard(html, friends_only):
    rows_src = [
        ("leila", "40 hours"),
        ("amira", "31 hours"),
        ("tester", "25 hours"),
        ("james", "18 hours"),
        ("omar", "12 hours"),
    ]
    if friends_only:
        allowed = set(STATE["friends"]) | {"tester"}
        rows_src = [row for row in rows_src if row[0] in allowed]
    rows = []
    for rank, (name, hours) in enumerate(rows_src, start=1):
        klass = ' class="highlight"' if name == "tester" else ""
        rows.append(f"<tr{klass}><td>{rank}</td><td>{esc(name)}</td><td>{hours}</td></tr>")
    html = html.replace("<tbody>", "<tbody>" + "".join(rows), 1)
    if friends_only:
        html = html.replace('href="/leaderboard/friends"', 'href="/leaderboard/friends" class="active"', 1)
    else:
        html = html.replace('href="/leaderboard"', 'href="/leaderboard" class="active"', 1)
    return html


def fill_profile(html):
    html = html.replace('th:text="${user.username}">Username', ">Tester", 1)
    html = html.replace(
        """th:text="${user.firstname + ' ' + user.lastname}">Full Name""",
        ">Sam Tester",
        1,
    )
    html = html.replace('th:text="${user.skillLevel}">Skill Level', ">Intermediate", 1)
    html = html.replace('th:text="${completionCount}">0', ">4", 1)
    html = html.replace('th:text="${totalLearningHours}">0', ">25", 1)
    html = re.sub(
        r'<p class="bio"[^>]*>[\s\S]*?</p>',
        "<p class=\"bio\">Trying the AI, data, and cybersecurity courses. This tester account is filled with sample progress so the pages are not empty.</p>",
        html,
        count=1,
    )
    html = strip_marked(html, "!userProfile.preferredCourseCategories.isEmpty()")
    html = html.replace(
        'class="no-data-message">No interests added yet.</p>',
        'class="no-data-message" hidden></p><div class="interests-list"><span class="interest-tag">AI</span><span class="interest-tag">Data Science</span><span class="interest-tag">Cybersecurity</span></div>',
        1,
    )
    html = strip_marked(html, "badges != null && !badges.isEmpty()")
    html = html.replace(
        'class="no-data-message">No achievements earned yet. Complete courses to earn badges!</p>',
        'class="no-data-message" hidden></p>'
        '<div class="badges-grid"><div class="badge-item"><div class="badge-image"><img src="/photos/bronze-badge.png" alt="Bronze badge"></div>'
        '<div class="badge-details"><h3>BRONZE</h3><p>Earned on: <span>02 Oct 2026</span></p></div></div></div>',
        1,
    )
    html = strip_marked(html, 'th:if="${coursesInProgress != null && !coursesInProgress.isEmpty()}"')
    html = strip_marked(html, 'th:if="${completions != null && !completions.isEmpty()}"')
    history = """
<div class="history-section">
  <h3 class="history-section-title">Courses Completed</h3>
  <div class="completion-timeline">
    <div class="timeline-item"><div class="timeline-icon completed"><i class="fas fa-check-circle"></i></div>
      <div class="timeline-content"><h3>Completed Data Science Fundamentals</h3><p>7h · 06 Nov 2026</p></div></div>
    <div class="timeline-item"><div class="timeline-icon completed"><i class="fas fa-check-circle"></i></div>
      <div class="timeline-content"><h3>Completed An Introduction to Cloud Computing</h3><p>7h · 01 Nov 2026</p></div></div>
    <div class="timeline-item"><div class="timeline-icon completed"><i class="fas fa-check-circle"></i></div>
      <div class="timeline-content"><h3>Completed Cybersecurity Fundamentals</h3><p>5h · 18 Oct 2026</p></div></div>
  </div>
</div>
<div class="history-section">
  <h3 class="history-section-title">Courses Started</h3>
  <div class="completion-timeline">
    <div class="timeline-item"><div class="timeline-icon started"><i class="fas fa-play-circle"></i></div>
      <div class="timeline-content"><h3>Started Cyber Investigator</h3><p>10 Nov 2026</p></div></div>
    <div class="timeline-item"><div class="timeline-icon started"><i class="fas fa-play-circle"></i></div>
      <div class="timeline-content"><h3>Started Machine Learning with Python</h3><p>08 Nov 2026</p></div></div>
  </div>
</div>
"""
    html = html.replace(
        'class="no-data-message">No learning activity yet. Start learning to build your history!</p>',
        'class="no-data-message" hidden></p>' + history,
        1,
    )
    return html


def bookmark_card(course):
    level = course["level"].lower()
    return f"""
<div class="course-card">
  <button type="button" onclick="toggleBookmark(this)" data-course-id="{course['id']}" class="bookmark-btn"><i class="fas fa-bookmark"></i></button>
  <div class="course-image"><img src="{course['thumbnail']}" alt="Course Thumbnail"></div>
  <div class="course-info">
    <h3>{esc(course['title'])}</h3>
    <p>{esc(course['description'])}</p>
    <div class="course-meta"><span class="category">{esc(course['category'])}</span><span class="level {level}">{esc(course['level'])}</span></div>
    <div class="card-actions"><a href="{course['url']}" class="start-learning-btn" target="_blank" rel="noopener">Start Learning</a></div>
  </div>
</div>
"""


def history_item(title, when, pretty, status, detail):
    icon = "fa-play-circle" if status == "started" else "fa-check-circle"
    verb = "Started" if status == "started" else "Completed"
    return f"""
<div class="timeline-item" data-date="{when}" data-status="{status}">
  <div class="timeline-icon {status}"><i class="fas {icon}"></i></div>
  <div class="timeline-content">
    <div class="timeline-date">{pretty}</div>
    <h3>{verb} {esc(title)}</h3>
    <div class="timeline-details">{detail}</div>
  </div>
</div>
"""


def fill_learning_history(html):
    html = strip_marked(html, "completions.isEmpty() && coursesInProgress.isEmpty()")
    started = (
        history_item("Cyber Investigator", "2026-11-10 09:05", "10 Nov 2026, 09:05 am", "started", "Started: 10 Nov 2026")
        + history_item("Machine Learning with Python", "2026-11-08 15:20", "08 Nov 2026, 03:20 pm", "started", "Started: 08 Nov 2026")
    )
    completed = (
        history_item("Data Science Fundamentals", "2026-11-06 18:40", "06 Nov 2026, 06:40 pm", "completed", "7h 0m · Completed: 06 Nov 2026")
        + history_item("An Introduction to Cloud Computing", "2026-11-01 16:00", "01 Nov 2026, 04:00 pm", "completed", "7h 0m · Completed: 01 Nov 2026")
        + history_item("Cybersecurity Fundamentals", "2026-10-18 11:15", "18 Oct 2026, 11:15 am", "completed", "5h 0m · Completed: 18 Oct 2026")
        + history_item("Artificial Intelligence Fundamentals", "2026-10-02 14:30", "02 Oct 2026, 02:30 pm", "completed", "6h 0m · Completed: 02 Oct 2026")
    )
    chunks = html.split('<div class="completion-timeline">')
    if len(chunks) == 3:
        html = chunks[0] + '<div class="completion-timeline">' + started + chunks[1] + '<div class="completion-timeline">' + completed + chunks[2]
    return html


def fill_bookmarks(html):
    if not STATE["bookmarks"]:
        return html
    html = strip_marked(html, "#lists.isEmpty(bookmarkedCourses)")
    cards = "".join(bookmark_card(BY_ID[i]) for i in sorted(STATE["bookmarks"]) if i in BY_ID)
    return html.replace('<div class="bookmarks-grid">', '<div class="bookmarks-grid">' + cards, 1)


def render_page(path):
    template = (TEMPLATES / PAGES[path]).read_text(encoding="utf-8")
    html = rewrite_th(template)
    if path in ("/dashboard",):
        html = fill_dashboard(html)
    elif path == "/course":
        html = fill_course(html)
    elif path == "/hexahive":
        html = fill_hexahive(html)
    elif path == "/friends":
        html = fill_friends(html)
    elif path in ("/leaderboard", "/leaderboard/friends"):
        html = fill_leaderboard(html, friends_only=path.endswith("/friends"))
    elif path == "/profile":
        html = fill_profile(html)
    elif path == "/profile/learning-history":
        html = fill_learning_history(html)
    elif path in ("/bookmarks", "/bookmarks.html"):
        html = fill_bookmarks(html)
    if path not in ("/", "/login", "/register", "/forgot-password"):
        html = inject_banner(html)
    return html.encode("utf-8")


def filter_courses(query):
    text = (query.get("query", [""])[0] or "").strip().lower()
    category = (query.get("category", [""])[0] or "").strip()
    level = (query.get("level", [""])[0] or "").strip()
    found = []
    for course in COURSES:
        if text and text not in course["title"].lower() and text not in course["description"].lower():
            continue
        if category and course["category"] != category:
            continue
        if level and course["level"] != level:
            continue
        found.append(course_json(course))
    return found


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def _send(self, code, body, content_type, extra_headers=None):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        if extra_headers:
            for key, value in extra_headers:
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(data)

    def _json(self, payload, code=200):
        self._send(code, json.dumps(payload), "application/json")

    def _redirect(self, location):
        self._send(302, "", "text/plain", [("Location", location)])

    def _query(self):
        return parse_qs(urlparse(self.path).query)

    def _route(self):
        return unquote(urlparse(self.path).path)

    def do_GET(self):
        path = self._route()
        query = self._query()
        if path == "/api/courses/search-and-filter":
            return self._json(filter_courses(query))
        course_match = re.fullmatch(r"/api/courses/(\d+)", path)
        if course_match:
            course = BY_ID.get(int(course_match.group(1)))
            if not course:
                return self._json({"error": "not found"}, 404)
            return self._json(course_json(course))
        review_match = re.fullmatch(r"/api/courses/(\d+)/reviews", path)
        if review_match:
            return self._json(reviews_for(int(review_match.group(1))))
        count_match = re.fullmatch(r"/api/courses/(\d+)/reviews/count", path)
        if count_match:
            return self._json(len(reviews_for(int(count_match.group(1)))))
        if path == "/api/course-completion/my":
            return self._json(COMPLETIONS)
        if path == "/api/course-in-progress/my":
            return self._json(IN_PROGRESS)
        progress_get = re.fullmatch(r"/api/course-in-progress/get/(\d+)", path)
        if progress_get:
            course_id = int(progress_get.group(1))
            item = next((row for row in IN_PROGRESS if row["courseId"] == course_id), None)
            if not item:
                item = {"courseId": course_id, "startTime": "2026-11-01T10:00:00"}
            return self._json(item)
        if path == "/hexahive/score":
            return self._json({"highScore": 2400})
        if path == "/get-bookmarks-preview":
            items = []
            for course_id in sorted(STATE["bookmarks"]):
                course = BY_ID.get(course_id)
                if course:
                    items.append({"course": course_json(course)})
            return self._json(items)
        if path == "/check-bookmark":
            try:
                course_id = int(query.get("courseId", ["0"])[0])
            except ValueError:
                course_id = 0
            return self._send(200, "true" if course_id in STATE["bookmarks"] else "false", "text/plain")
        if path == "/friends/search":
            text = (query.get("query", [""])[0] or "").strip().lower()
            names = [name for name in PEOPLE if text and text in name and name not in STATE["friends"]]
            return self._json([{"username": name} for name in names])
        summary = re.fullmatch(r"/friends/summary/([^/]+)", path)
        if summary:
            person = PEOPLE.get(summary.group(1))
            if not person:
                return self._json({}, 404)
            badges = []
            for kind in person["badges"]:
                badges.append({"type": kind, "imagePath": BADGE_IMG[kind], "earnedAt": "2026-10-02T12:00:00"})
            return self._json({
                "bio": person["bio"],
                "totalHours": person["hours"],
                "highestScore": person["score"],
                "badges": badges,
            })
        if path in PAGES:
            return self._send(200, render_page(path), "text/html; charset=utf-8")
        return self._static(path)

    def do_POST(self):
        path = self._route()
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(length).decode("utf-8", errors="replace") if length else ""
        form = parse_qs(raw)
        if path in ("/login",):
            return self._redirect("/dashboard")
        if path == "/logout":
            return self._redirect("/login")
        if path == "/hexahive/score":
            return self._send(200, "saved", "text/plain")
        if path == "/api/course-completion":
            data = read_json(raw)
            try:
                course_id = int(data.get("courseId") or 0)
            except (TypeError, ValueError):
                course_id = 0
            record = {
                "courseId": course_id,
                "startTime": data.get("startTime") or "2026-11-01T10:00:00",
                "completionTime": data.get("completionTime") or "2026-11-12T15:00:00",
                "durationHours": int(data.get("durationHours") or 0),
                "durationMinutes": int(data.get("durationMinutes") or 0),
            }
            COMPLETIONS.insert(0, record)
            IN_PROGRESS[:] = [row for row in IN_PROGRESS if row["courseId"] != course_id]
            return self._json(COMPLETIONS)
        review_post = re.fullmatch(r"/api/courses/(\d+)/reviews", path)
        if review_post:
            course_id = int(review_post.group(1))
            data = read_json(raw)
            STATE["review_seq"] += 1
            review = {
                "id": STATE["review_seq"],
                "username": "tester",
                "rating": int(data.get("rating") or 5),
                "comment": data.get("comment") or "Completed this course.",
                "date": "2026-11-12",
            }
            STATE["extra_reviews"].setdefault(course_id, []).insert(0, review)
            return self._json(review)
        progress_post = re.fullmatch(r"/api/course-in-progress/(\d+)", path)
        if progress_post:
            course_id = int(progress_post.group(1))
            existing = next((row for row in IN_PROGRESS if row["courseId"] == course_id), None)
            if not existing:
                existing = {"courseId": course_id, "startTime": "2026-11-12T15:00:00"}
                IN_PROGRESS.insert(0, existing)
            return self._json(existing)
        if path == "/toggle-bookmark":
            try:
                course_id = int(form.get("courseId", ["0"])[0])
            except ValueError:
                course_id = 0
            if course_id in STATE["bookmarks"]:
                STATE["bookmarks"].discard(course_id)
                return self._send(200, "removed", "text/plain")
            if course_id in BY_ID:
                STATE["bookmarks"].add(course_id)
            return self._send(200, "added", "text/plain")
        if path == "/friends/request":
            name = (form.get("recipientUsername", [""])[0] or "").strip().lower()
            if name not in PEOPLE:
                return self._send(400, "No user found with that name. Try amira, james, leila, or omar.", "text/plain")
            if name in STATE["friends"] or any(item["username"] == name for item in STATE["pending"]):
                return self._send(200, f"{name} is already on your friends list.", "text/plain")
            STATE["pending"].append({"id": STATE["next_id"], "username": name})
            STATE["next_id"] += 1
            return self._send(200, f"Friend request sent to {name}.", "text/plain")
        accept = re.fullmatch(r"/friends/accept/(\d+)", path)
        if accept:
            request_id = int(accept.group(1))
            kept = []
            for item in STATE["pending"]:
                if item["id"] == request_id:
                    if item["username"] not in STATE["friends"]:
                        STATE["friends"].append(item["username"])
                else:
                    kept.append(item)
            STATE["pending"] = kept
            return self._send(200, "accepted", "text/plain")
        decline = re.fullmatch(r"/friends/decline/(\d+)", path)
        if decline:
            request_id = int(decline.group(1))
            STATE["pending"] = [item for item in STATE["pending"] if item["id"] != request_id]
            return self._send(200, "declined", "text/plain")
        remove = re.fullmatch(r"/friends/remove/([^/]+)", path)
        if remove:
            name = unquote(remove.group(1))
            STATE["friends"] = [friend for friend in STATE["friends"] if friend != name]
            return self._send(200, "removed", "text/plain")
        return self._send(200, "ok", "text/plain")

    def do_DELETE(self):
        path = self._route()
        match = re.fullmatch(r"/api/course-in-progress/(\d+)", path)
        if match:
            course_id = int(match.group(1))
            IN_PROGRESS[:] = [row for row in IN_PROGRESS if row["courseId"] != course_id]
            return self._json({"removed": course_id})
        return self._json({"ok": True})

    def _static(self, path):
        rel = path.lstrip("/")
        file_path = (STATIC / rel).resolve()
        if not str(file_path).startswith(str(STATIC.resolve())) or not file_path.is_file():
            return self._send(404, "Not found", "text/plain")
        kind = {
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".avif": "image/avif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
        }.get(file_path.suffix.lower(), "application/octet-stream")
        self._send(200, file_path.read_bytes(), kind)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Skills Hive tester preview at http://{HOST}:{PORT}/login")
    server.serve_forever()
