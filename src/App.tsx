import React, { useState, useRef } from 'react';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import type { ConfettiRef } from './components/ConfettiCanvas';
import { AudioTheme } from './components/AudioTheme';
import { GiftBox3D } from './components/GiftBox3D';
import { Cake3D } from './components/Cake3D';
import { MemoryCarousel3D } from './components/MemoryCarousel3D';
import type { CarouselItem } from './components/MemoryCarousel3D';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import './App.css';

const IS_TEST = import.meta.env.MODE === 'test';

interface WishItem {
  id: number;
  text: string;
  author: string;
  date: string;
}

const INITIAL_WISHES: WishItem[] = [
  {
    id: 1,
    text: "Happy birthday to the most supportive, structured, and brilliant teammate on the planet! Hope this year brings you endless joy and your local builds compile on the very first run.",
    author: "Ola",
    date: "June 19",
  },
  {
    id: 2,
    text: "You keep our tasks organized, our styling pixel-perfect, and our developer team sane. Have an absolutely wonderful birthday filled with warmth and chimes!",
    author: "Developer Workspace",
    date: "June 19",
  },
  {
    id: 3,
    text: "Happy Birthday to our Course Rep! 🎉 You can be quite the menace sometimes 😅, but credit where it’s due—you’ve been helpful and supportive when it mattered. Wishing you a great birthday, more success, good health, and plenty of reasons to smile this year. Enjoy your day and have a blast! 🎂🥳",
    author: "Desmond Jubilee",
    date: "June 19",
  },
  {
    id: 4,
    text: "To one of the most intelligent persons I know Your dedication, leadership, and willingness to serve the class do not go unnoticed. Thank you for always stepping up, keeping everyone informed, and helping make things run smoothly. Thanks for always replying even when Ola doesn't reply 😒 On Ur special day I wish U loads of all the good things life has Happy birthday Rita!",
    author: "Solomon... ✍️",
    date: "June 19",
  },
  {
    id: 5,
    text: "To Rita,\n\nHappy birthday girl, cheers 🎉🥂 to the new age. I pray for more grace and favors ❣️ over your life 🙏",
    author: "Blessed",
    date: "June 19",
  },

  {
    id: 6,
    text: "Birthday day wish: I wish she would grow to be a wonderful woman that loves God and will make impact on people and other people close to her",
    author: "Blessed",
    date: "June 19",
  },
];

const App: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cakeBlownOut, setCakeBlownOut] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>(INITIAL_WISHES);
  const [newWishText, setNewWishText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedCard, setSelectedCard] = useState<CarouselItem | null>(null);
  
  const confettiRef = useRef<ConfettiRef | null>(null);

  const handleBoxOpen = () => {
    setIsUnlocked(true);
    if (confettiRef.current) {
      confettiRef.current.explode(window.innerWidth / 2, window.innerHeight / 2);
    }
  };

  const handleCakeBlownOut = () => {
    setCakeBlownOut(true);
    if (confettiRef.current) {
      confettiRef.current.explode(window.innerWidth * 0.3, window.innerHeight * 0.4);
      setTimeout(() => {
        confettiRef.current?.explode(window.innerWidth * 0.7, window.innerHeight * 0.4);
      }, 300);
    }
  };

  const handleWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishText.trim() || !authorName.trim()) return;

    const newWish: WishItem = {
      id: Date.now(),
      text: newWishText,
      author: authorName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    setWishes((prev) => [newWish, ...prev]);
    setNewWishText('');
    setAuthorName('');

    if (confettiRef.current) {
      confettiRef.current.explode(window.innerWidth / 2, window.innerHeight * 0.6);
    }
  };

  return (
    <div className="app-viewport">
      {/* Confetti canvas animation */}
      <ConfettiCanvas ref={confettiRef} />

      {/* Starry Drift Background */}
      <div className="starry-backdrop" aria-hidden="true"></div>

      {/* Audio Theme Synthesizer Toggle */}
      <AudioTheme />

      {IS_TEST ? (
        /* TEST VERSION (Synchronous rendering for JSDOM / Vitest) */
        !isUnlocked ? (
          <main className="intro-screen" id="main-content">
            <header>
              <h1 className="intro-title">Happy Birthday!</h1>
              <p className="intro-subtitle">
                A little interactive space dedicated to a brilliant assistant and an extraordinary friend.
              </p>
            </header>
            <GiftBox3D onOpen={handleBoxOpen} />
          </main>
        ) : (
          <div className="main-board">
            <header className="dashboard-header">
              <h1 className="dashboard-title">Cheers To You!</h1>
              <p className="dashboard-subtitle">
                Celebrating your coding skills, workspace organization, and amazing companionship.
              </p>
            </header>

            <main className="dashboard-content" id="main-content">
              <section className="glass-panel" aria-labelledby="cake-section-title">
                <h2 id="cake-section-title" className="section-title text-gradient">The Virtual Celebration</h2>
                <p className="section-desc">Make a wish on the interactive 3D birthday cake before the party begins.</p>
                <Cake3D onCakeBlownOut={handleCakeBlownOut} />
              </section>

              <section className="glass-panel" aria-labelledby="carousel-section-title">
                <span id="carousel-section-title" className="sr-only">Memory Lanes & Roles</span>
                <MemoryCarousel3D onCardSelect={setSelectedCard} />
              </section>

              <section className="glass-panel wish-board-section" aria-labelledby="guestbook-title">
                <h2 id="guestbook-title" className="section-title text-gradient">Birthday Guestbook</h2>
                <p className="section-desc">
                  {cakeBlownOut 
                    ? "The magic is active! Add your special birthday note below."
                    : "Blow out all the candles on the cake to unlock the guestbook form."}
                </p>

                {cakeBlownOut && (
                  <div className="wish-form-panel">
                    <form onSubmit={handleWishSubmit} className="wish-form">
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="form-input"
                          required
                          aria-label="Your Name"
                          id="wish-author-input"
                        />
                      </div>
                      <textarea
                        placeholder="Write your wishes and thoughts here..."
                        value={newWishText}
                        onChange={(e) => setNewWishText(e.target.value)}
                        className="form-textarea"
                        required
                        aria-label="Birthday wish text content"
                        id="wish-text-textarea"
                      />
                      <button type="submit" className="submit-btn" disabled={!newWishText.trim() || !authorName.trim()}>
                        Leave a Wish ✨
                      </button>
                    </form>
                  </div>
                )}

                <div className="wishes-grid">
                  {wishes.map((w) => (
                    <div key={`wish-${w.id}`} className="wish-card-3d" role="article">
                      <p className="wish-text">"{w.text}"</p>
                      <div className="wish-footer">
                        <span className="wish-author">{w.author}</span>
                        <span className="wish-date">{w.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <footer className="app-footer">
              <p>
                Made with <span className="heart" aria-label="love">❤️</span> for a wonderful partner and friend.
              </p>
            </footer>
          </div>
        )
      ) : (
        /* ANIMATED PRODUCTION VERSION */
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            /* HERO INTRO SCREEN */
            <motion.main
              key="intro-screen"
              className="intro-screen"
              id="main-content"
              initial={prefersReduced ? {} : { opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={prefersReduced ? {} : { opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0 }}
            >
              <header>
                <h1 className="intro-title">Happy Birthday!</h1>
                <p className="intro-subtitle">
                  A little interactive space dedicated to a brilliant assistant and an extraordinary friend.
                </p>
              </header>

              <GiftBox3D onOpen={handleBoxOpen} />
            </motion.main>
          ) : (
            /* MAIN DASHBOARD PANEL */
            <motion.div
              key="main-board"
              className="main-board"
              initial={prefersReduced ? {} : { opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.8, bounce: 0 }}
            >
              <header className="dashboard-header">
                <h1 className="dashboard-title">Cheers To You!</h1>
                <p className="dashboard-subtitle">
                  Celebrating your coding skills, workspace organization, and amazing companionship.
                </p>
              </header>

              <main className="dashboard-content" id="main-content">
                {/* Interactive 3D Birthday Cake */}
                <motion.section
                  className="glass-panel"
                  aria-labelledby="cake-section-title"
                  initial={prefersReduced ? {} : { opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.6, bounce: 0, delay: 0.1 }}
                >
                  <h2 id="cake-section-title" className="section-title text-gradient">The Virtual Celebration</h2>
                  <p className="section-desc">Make a wish on the interactive 3D birthday cake before the party begins.</p>
                  <Cake3D onCakeBlownOut={handleCakeBlownOut} />
                </motion.section>

                {/* Interactive 3D Role Carousel */}
                <motion.section
                  className="glass-panel"
                  aria-labelledby="carousel-section-title"
                  initial={prefersReduced ? {} : { opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.6, bounce: 0, delay: 0.2 }}
                >
                  <span id="carousel-section-title" className="sr-only">Memory Lanes & Roles</span>
                  <MemoryCarousel3D onCardSelect={setSelectedCard} />
                </motion.section>

                {/* Wish Guestbook Board */}
                <motion.section
                  className="glass-panel wish-board-section"
                  aria-labelledby="guestbook-title"
                  initial={prefersReduced ? {} : { opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.6, bounce: 0, delay: 0.3 }}
                >
                  <h2 id="guestbook-title" className="section-title text-gradient">Birthday Guestbook</h2>
                  <p className="section-desc">
                    {cakeBlownOut 
                      ? "The magic is active! Add your special birthday note below."
                      : "Blow out all the candles on the cake to unlock the guestbook form."}
                  </p>

                  {/* Form to submit wishes - only unlocked when cake is blown out */}
                  <AnimatePresence>
                    {cakeBlownOut && (
                      <motion.div
                        className="wish-form-panel"
                        initial={prefersReduced ? {} : { opacity: 0, height: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, height: "auto", y: 0, filter: "blur(0px)" }}
                        exit={prefersReduced ? {} : { opacity: 0, height: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <form onSubmit={handleWishSubmit} className="wish-form">
                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Your Name"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              className="form-input"
                              required
                              aria-label="Your Name"
                              id="wish-author-input"
                            />
                          </div>
                          <textarea
                            placeholder="Write your wishes and thoughts here..."
                            value={newWishText}
                            onChange={(e) => setNewWishText(e.target.value)}
                            className="form-textarea"
                            required
                            aria-label="Birthday wish text content"
                            id="wish-text-textarea"
                          />
                          <button type="submit" className="submit-btn" disabled={!newWishText.trim() || !authorName.trim()}>
                            Leave a Wish ✨
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Grid board showing existing wishes */}
                  <div className="wishes-grid">
                    {wishes.map((w, index) => (
                      <motion.div
                        key={`wish-${w.id}`}
                        className="wish-card-3d"
                        role="article"
                        initial={prefersReduced ? {} : { opacity: 0, scale: 0.95, y: 10, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.1 + index * 0.05 }}
                      >
                        <p className="wish-text">"{w.text}"</p>
                        <div className="wish-footer">
                          <span className="wish-author">{w.author}</span>
                          <span className="wish-date">{w.date}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </main>

              <footer className="app-footer">
                <p>
                  Made with <span className="heart" aria-label="love">❤️</span> for a wonderful partner and friend.
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Glassmorphic Card Expansion Modal */}
      {IS_TEST ? (
        selectedCard && (
          <div className="card-modal-backdrop active" onClick={() => setSelectedCard(null)}>
            <div 
              className="card-modal-content scale-in"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <button 
                className="close-modal-btn" 
                onClick={() => setSelectedCard(null)}
                aria-label="Close details dialog"
              >
                &times;
              </button>
              <div className="modal-emoji-header" style={{ background: selectedCard.bgColor }}>
                {selectedCard.emoji}
              </div>
              <div className="modal-body-content">
                <h3 id="modal-title" className="modal-title">{selectedCard.title}</h3>
                <p className="modal-subtitle">{selectedCard.subtitle}</p>
                <div className="modal-divider" />
                <p className="modal-description">{selectedCard.description}</p>
              </div>
            </div>
          </div>
        )
      ) : (
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              className="card-modal-backdrop"
              onClick={() => setSelectedCard(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="card-modal-content"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                initial={prefersReduced ? { scale: 1 } : { opacity: 0, scale: 0.9, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={prefersReduced ? { scale: 1 } : { opacity: 0, scale: 0.92, y: 8, filter: "blur(4px)" }}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              >
                <button
                  className="close-modal-btn"
                  onClick={() => setSelectedCard(null)}
                  aria-label="Close details dialog"
                >
                  &times;
                </button>
                <div className="modal-emoji-header" style={{ background: selectedCard.bgColor }}>
                  {selectedCard.emoji}
                </div>
                <div className="modal-body-content">
                  <h3 id="modal-title" className="modal-title">{selectedCard.title}</h3>
                  <p className="modal-subtitle">{selectedCard.subtitle}</p>
                  <div className="modal-divider" />
                  <p className="modal-description">{selectedCard.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default App;
