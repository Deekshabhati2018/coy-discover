

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  X,
  Home,
  Compass,
  MessageCircle,
  MapPin,
  Sparkles,
} from "lucide-react";

import { getFeed, getMatches, swipeProfile } from "./api";
import "./App.css";

function App() {
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState("");
  const [newMatch, setNewMatch] = useState(null);

  const loadData = async () => {
    try {
      const [feed, matchList] = await Promise.all([
        getFeed(),
        getMatches(),
      ]);

      setProfiles(feed);
      setMatches(matchList);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to Coy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwipe = async (profile, action) => {
    if (swiping || !profile) return;

    setSwiping(true);
    setError("");

    try {
      const result = await swipeProfile(profile.id, action);

      // Remove the swiped profile from the feed
      setProfiles((current) =>
        current.filter((item) => item.id !== profile.id)
      );

      if (result.matched) {
        const updatedMatches = await getMatches();
        setMatches(updatedMatches);
        setNewMatch(profile);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Could not save your swipe."
      );
    } finally {
      setSwiping(false);
    }
  };

  const currentProfile = profiles[0];

  if (loading) {
    return <div className="loading-screen">Loading Coy...</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon"><Heart size={21} fill="white" /></span>
          <span>coy<span className="brand-light">.</span></span>
        </div>
        <div className="topbar-tag">Meet your kind of people</div>
      </header>

      <main className="main-content">
        {activeTab === "discover" && (
          <section className="discover-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR NEXT CONNECTION</p>
                <h1>Discover</h1>
                <p className="subtitle">
                  Good connections start with a hello.
                </p>
              </div>
              <div className="profile-count">
                <Sparkles size={15} />
                {profiles.length} left
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {currentProfile ? (
              <div className="card-area">
                <AnimatePresence mode="wait">
                  <motion.article
                    key={currentProfile.id}
                    className="profile-card"
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, x: 100 }}
                    transition={{ duration: 0.22 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.75}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 100) {
                        handleSwipe(currentProfile, "like");
                      } else if (info.offset.x < -100) {
                        handleSwipe(currentProfile, "pass");
                      }
                    }}
                  >
                    <div className="profile-photo">
                      {currentProfile.photo ? (
                        <img
                          src={currentProfile.photo}
                          alt={currentProfile.name}
                          draggable="false"
                        />
                      ) : (
                        <div className="photo-placeholder">
                          {currentProfile.name?.charAt(0)}
                        </div>
                      )}

                      <div className="photo-gradient" />

                      <div className="profile-details">
                        <h2>
                          {currentProfile.name}, {currentProfile.age}
                        </h2>

                        <p className="location">
                          <MapPin size={16} />
                          {currentProfile.city}
                        </p>

                        <p className="bio">{currentProfile.bio}</p>
                      </div>
                    </div>

                    <div className="profile-info">
                      <p className="interests-label">INTERESTS</p>
                      <div className="interest-list">
                        {currentProfile.interests?.map((interest) => (
                          <span className="interest-chip" key={interest}>
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>

                <div className="swipe-actions">
                  <button
                    className="action-button pass-button"
                    onClick={() => handleSwipe(currentProfile, "pass")}
                    disabled={swiping}
                    aria-label="Pass"
                  >
                    <X size={28} />
                  </button>

                  <button
                    className="action-button like-button"
                    onClick={() => handleSwipe(currentProfile, "like")}
                    disabled={swiping}
                    aria-label="Like"
                  >
                    <Heart size={27} fill="white" />
                  </button>
                </div>

                <p className="swipe-hint">
                  Swipe right to like · Swipe left to pass
                </p>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><Heart size={34} /></div>
                <h2>You've seen everyone!</h2>
                <p>Check back later for more people to discover.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "matches" && (
          <section className="matches-section">
            <p className="eyebrow">YOUR CONNECTIONS</p>
            <h1>Your Matches</h1>
            <p className="subtitle">People who liked you back.</p>

            {matches.length > 0 ? (
              <div className="matches-grid">
                {matches.map((match) => (
                  <div className="match-card" key={match.id}>
                    {match.photo ? (
                      <img src={match.photo} alt={match.name} />
                    ) : (
                      <div className="match-placeholder">
                        {match.name?.charAt(0)}
                      </div>
                    )}
                    <div className="match-card-info">
                      <h3>{match.name}, {match.age}</h3>
                      <p>{match.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <MessageCircle size={35} />
                <h2>No matches yet</h2>
                <p>Keep discovering to find your connection.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "home" && (
          <section className="home-section">
            <div className="home-icon"><Heart size={32} /></div>
            <p className="eyebrow">WELCOME TO COY</p>
            <h1>Connections that feel right.</h1>
            <p className="subtitle">
              Discover interesting people and find meaningful connections.
            </p>
            <button
              className="primary-button"
              onClick={() => setActiveTab("discover")}
            >
              Start Discovering <Compass size={17} />
            </button>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={activeTab === "home" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("home")}
        >
          <Home size={21} />
          <span>Home</span>
        </button>

        <button
          className={activeTab === "discover" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("discover")}
        >
          <Compass size={21} />
          <span>Discover</span>
        </button>

        <button
          className={activeTab === "matches" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("matches")}
        >
          <MessageCircle size={21} />
          <span>Matches</span>
          {matches.length > 0 && (
            <span className="match-badge">{matches.length}</span>
          )}
        </button>
      </nav>

      {newMatch && (
        <div className="match-overlay">
          <motion.div
            className="match-popup"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="match-heart"><Heart fill="white" size={35} /></div>
            <p className="eyebrow">IT'S OFFICIAL</p>
            <h2>It's a match!</h2>
            <p>You and {newMatch.name} liked each other.</p>
            <button
              className="primary-button"
              onClick={() => {
                setNewMatch(null);
                setActiveTab("matches");
              }}
            >
              View Matches
            </button>
            <button
              className="close-match"
              onClick={() => setNewMatch(null)}
            >
              Keep Discovering
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;
