

import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = 5000;
const CURRENT_USER_ID = 1;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Coy Discover API is running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Discover feed: return only profiles not swiped on yet
app.get("/feed", (req, res) => {
  try {
    const profiles = db.prepare(`
      SELECT id, name, age, photo, bio, city, interests
      FROM users
      WHERE id != ?
      AND id NOT IN (
        SELECT swiped_id
        FROM swipes
        WHERE swiper_id = ?
      )
      ORDER BY id
    `).all(CURRENT_USER_ID, CURRENT_USER_ID);

    const formattedProfiles = profiles.map((profile) => ({
      ...profile,
      interests: JSON.parse(profile.interests || "[]"),
    }));

    res.json(formattedProfiles);
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Could not load feed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/swipe", (req, res) => {
  try {
    const { profileId, action } = req.body;

    // Validate input
    if (!profileId || !["like", "pass"].includes(action)) {
      return res.status(400).json({
        error: "Valid profileId and action (like/pass) are required",
      });
    }

    if (Number(profileId) === CURRENT_USER_ID) {
      return res.status(400).json({ error: "You cannot swipe on yourself" });
    }

    const profile = db.prepare(
      "SELECT id FROM users WHERE id = ?"
    ).get(profileId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const existingSwipe = db.prepare(`
      SELECT id FROM swipes
      WHERE swiper_id = ? AND swiped_id = ?
    `).get(CURRENT_USER_ID, profileId);

    if (existingSwipe) {
      return res.status(409).json({ error: "Already swiped on this profile" });
    }

    // Save swipe and check for mutual like in one transaction
    const result = db.transaction(() => {
      db.prepare(`
        INSERT INTO swipes (swiper_id, swiped_id, action)
        VALUES (?, ?, ?)
      `).run(CURRENT_USER_ID, profileId, action);

      let matched = false;

      if (action === "like") {
        const reciprocalLike = db.prepare(`
          SELECT id FROM swipes
          WHERE swiper_id = ? AND swiped_id = ? AND action = 'like'
        `).get(profileId, CURRENT_USER_ID);

        if (reciprocalLike) {
          const userOne = Math.min(CURRENT_USER_ID, Number(profileId));
          const userTwo = Math.max(CURRENT_USER_ID, Number(profileId));

          db.prepare(`
            INSERT OR IGNORE INTO matches (user_one_id, user_two_id)
            VALUES (?, ?)
          `).run(userOne, userTwo);

          matched = true;
        }
      }

      return matched;
    })();

    res.json({
      success: true,
      matched: result,
      message: result ? "It's a match!" : "Swipe saved successfully",
    });

  } catch (error) {
    console.error("Swipe error:", error);
    res.status(500).json({ error: "Could not process swipe" });
  }
});

app.get("/matches", (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT
        users.id,
        users.name,
        users.age,
        users.photo,
        users.bio,
        users.city,
        users.interests
      FROM matches
      JOIN users
        ON users.id = CASE
          WHEN matches.user_one_id = ? THEN matches.user_two_id
          ELSE matches.user_one_id
        END
      WHERE matches.user_one_id = ?
         OR matches.user_two_id = ?
      ORDER BY matches.id DESC
    `).all(CURRENT_USER_ID, CURRENT_USER_ID, CURRENT_USER_ID);

    const formattedMatches = matches.map((profile) => ({
      ...profile,
      interests: JSON.parse(profile.interests || "[]"),
    }));

    res.json(formattedMatches);
  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({ error: "Could not load matches" });
  }
});

