
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const dataDirectory = path.resolve(currentDir, "../data");

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(
  path.join(dataDirectory, "coy.sqlite")
);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    photo TEXT,
    bio TEXT,
    city TEXT,
    interests TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    swiper_id INTEGER NOT NULL,
    swiped_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('like', 'pass')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (swiper_id) REFERENCES users(id),
    FOREIGN KEY (swiped_id) REFERENCES users(id),

    UNIQUE(swiper_id, swiped_id),
    CHECK(swiper_id != swiped_id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_one_id INTEGER NOT NULL,
    user_two_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_one_id) REFERENCES users(id),
    FOREIGN KEY (user_two_id) REFERENCES users(id),

    UNIQUE(user_one_id, user_two_id),
    CHECK(user_one_id < user_two_id)
  );

  CREATE INDEX IF NOT EXISTS idx_swipes_swiper
  ON swipes(swiper_id);

  CREATE INDEX IF NOT EXISTS idx_matches_user_one
  ON matches(user_one_id);

  CREATE INDEX IF NOT EXISTS idx_matches_user_two
  ON matches(user_two_id);
`);

// Seed the logged-in demo user
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users
  (id, name, age, photo, bio, city, interests)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run(
  1,
  "Alex",
  23,
  "https://i.pravatar.cc/400?img=12",
  "Coffee, conversations and weekend adventures.",
  "Gurgaon",
  JSON.stringify(["Travel", "Coffee", "Music"])
);

// Seed 30 discoverable mock profiles
const profiles = [
  ["Aarav", 23, "Exploring new places and finding great coffee.", "Gurgaon", ["Travel", "Photography", "Music"]],
  ["Ananya", 22, "Book lover with a soft spot for sunsets.", "Delhi", ["Reading", "Art", "Travel"]],
  ["Rohan", 24, "Fitness, food and spontaneous road trips.", "Noida", ["Fitness", "Food", "Travel"]],
  ["Meera", 21, "Creative soul who loves trying new things.", "Delhi", ["Art", "Dance", "Movies"]],
  ["Kabir", 25, "Tech enthusiast and amateur chef.", "Gurgaon", ["Technology", "Cooking", "Gaming"]],
  ["Isha", 23, "Collecting memories, not things.", "Noida", ["Travel", "Music", "Books"]],
  ["Vihaan", 22, "Always up for badminton and chai.", "Delhi", ["Sports", "Fitness", "Food"]],
  ["Sanya", 24, "Music festivals and mountain escapes.", "Gurgaon", ["Music", "Hiking", "Travel"]],
  ["Arjun", 26, "Startup stories and late-night drives.", "Noida", ["Technology", "Cars", "Coffee"]],
  ["Riya", 22, "A little bit of everything, a lot of curiosity.", "Delhi", ["Dance", "Photography", "Food"]],
  ["Aditya", 23, "Football on weekends, movies on weekdays.", "Gurgaon", ["Football", "Movies", "Fitness"]],
  ["Diya", 21, "Artist, dreamer and dessert enthusiast.", "Noida", ["Art", "Food", "Reading"]],
  ["Karan", 25, "Finding joy in the little things.", "Delhi", ["Travel", "Cooking", "Music"]],
  ["Tara", 23, "Nature, books and meaningful conversations.", "Gurgaon", ["Nature", "Books", "Photography"]],
  ["Reyansh", 24, "Building things and exploring the world.", "Noida", ["Technology", "Travel", "Gaming"]],
  ["Aditi", 22, "Dancing through life one playlist at a time.", "Delhi", ["Dance", "Music", "Fitness"]],
  ["Dev", 26, "Cricket, coffee and weekend adventures.", "Gurgaon", ["Cricket", "Coffee", "Travel"]],
  ["Myra", 23, "Foodie who loves discovering hidden cafes.", "Noida", ["Food", "Travel", "Photography"]],
  ["Samar", 22, "Into gaming, movies and good conversations.", "Delhi", ["Gaming", "Movies", "Technology"]],
  ["Kiara", 24, "Sunsets, skincare and spontaneous plans.", "Gurgaon", ["Beauty", "Travel", "Music"]],
  ["Neil", 25, "Cycling enthusiast and amateur photographer.", "Noida", ["Cycling", "Photography", "Nature"]],
  ["Pihu", 21, "Books, baking and beautiful places.", "Delhi", ["Books", "Cooking", "Travel"]],
  ["Dhruv", 23, "Always learning something new.", "Gurgaon", ["Technology", "Reading", "Sports"]],
  ["Sara", 25, "Love a good movie and better company.", "Noida", ["Movies", "Food", "Art"]],
  ["Yash", 24, "Adventure seeker and mountain lover.", "Delhi", ["Hiking", "Travel", "Photography"]],
  ["Naina", 22, "Making ordinary days memorable.", "Gurgaon", ["Dance", "Food", "Music"]],
  ["Atharv", 26, "Sports, startups and street food.", "Noida", ["Sports", "Technology", "Food"]],
  ["Zoya", 23, "Creative mind, curious heart.", "Delhi", ["Art", "Fashion", "Travel"]],
  ["Manav", 24, "Music and long drives.", "Gurgaon", ["Music", "Cars", "Photography"]],
  ["Aisha", 22, "Finding new cafes and new stories.", "Noida", ["Coffee", "Reading", "Travel"]]
];

const insertProfile = db.prepare(`
  INSERT OR IGNORE INTO users
  (id, name, age, photo, bio, city, interests)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const seedProfiles = db.transaction(() => {
  profiles.forEach((profile, index) => {
    const id = index + 2;

    insertProfile.run(
      id,
      profile[0],
      profile[1],
      `https://i.pravatar.cc/400?img=${id + 10}`,
      profile[2],
      profile[3],
      JSON.stringify(profile[4])
    );
  });
});

seedProfiles();

// Seed incoming likes to demonstrate mutual matching.
// These users have liked Alex, but Alex has not liked them yet.
const seedIncomingLikes = db.prepare(`
  INSERT OR IGNORE INTO swipes
  (swiper_id, swiped_id, action)
  VALUES (?, 1, 'like')
`);

[2, 4, 7, 10, 14, 18].forEach((id) => {
  seedIncomingLikes.run(id);
});

console.log("Database initialized successfully!");

export default db;
