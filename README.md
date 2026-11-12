# Skills Hive

A learning site with IBM SkillsBuild courses, bookmarks, friends, a leaderboard, and the HexaHive puzzle game.

This was a group project. I led the group and built part of it.

Live page: https://nno3.github.io/skills-hive/

Open that link and choose **Continue as tester**. The tester account is already filled with sample courses, friends, and scores.

## Run the same preview on your computer

```bash
python3 preview_server.py
```

Then open http://127.0.0.1:8895/login.

## Run the Spring app

You need Java 21 and MySQL. Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties` and add your own database and IBM Watson details.

```bash
./gradlew bootRun
```

Then open http://localhost:8080.
