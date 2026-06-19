import React, { useState, useRef, useCallback } from 'react';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import type { ConfettiRef } from './components/ConfettiCanvas';
import { AudioTheme } from './components/AudioTheme';
import { GiftBox3D } from './components/GiftBox3D';
import { Cake3D } from './components/Cake3D';
import { MemoryCarousel3D } from './components/MemoryCarousel3D';
import type { CarouselItem } from './components/MemoryCarousel3D';
import { motion, AnimatePresence } from './components/Motion';
import { useReducedMotion } from 'motion/react';
import { useFocusTrap } from './hooks/useFocusTrap';
import './App.css';

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
    text: "Happy Birthday to our Course Rep! You can be quite the menace sometimes, but credit where it's due. You've been helpful and supportive when it mattered. Wishing you a great birthday, more success, good health, and plenty of reasons to smile this year. Enjoy your day and have a blast!",
    author: "Desmond Jubilee",
    date: "June 19",
  },
  {
    id: 4,
    text: "To one of the most intelligent persons I know. Your dedication, leadership, and willingness to serve the class do not go unnoticed. Thank you for always stepping up, keeping everyone informed, and helping make things run smoothly. Happy birthday Rita!",
    author: "Solomon",
    date: "June 19",
  },
  {
    id: 5,
    text: "To Rita,\n\nHappy birthday girl, cheers to the new age. I pray for more grace and favors over your life.",
    author: "Blessed",
    date: "June 19",
  },
  {
    id: 6,
    text: "Birthday day wish: I wish she would grow to be a wonderful woman that loves God and will make impact on people and other people close to her.",
    author: "Blessed",
    date: "June 19",
  },
];

/* ── localStorage persistence for user-submitted wishes ── */

const USER_WISHES_KEY = 'birthday-rita-user-wishes';

const loadPersistedWishes = (): WishItem[] => {
  try {
    const stored = localStorage.getItem(USER_WISHES_KEY);
    if (stored) {
      const userWishes = JSON.parse(stored) as WishItem[];
      return [...userWishes, ...INITIAL_WISHES];
    }
  } catch {
    // Ignore parse errors gracefully
  }
  return INITIAL_WISHES;
};

const persistUserWishes = (allWishes: WishItem[]) => {
  try {
    const initialIds = new Set(INITIAL_WISHES.map((w) => w.id));
    const userWishes = allWishes.filter((w) => !initialIds.has(w.id));
    localStorage.setItem(USER_WISHES_KEY, JSON.stringify(userWishes));
  } catch {
    // Ignore storage errors (e.g. quota exceeded, private mode)
  }
};

/* ── Motion presets (Jakub-weighted: spring, bounce: 0, exits subtler) ── */

const ENTER_SPRING = { type: "spring" as const, duration: 0.5, bounce: 0 };
const EXIT_SPRING  = { type: "spring" as const, duration: 0.35, bounce: 0 };

const enterProps = (reduced: boolean | null, delay = 0) => ({
  initial: reduced ? {} : { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { ...ENTER_SPRING, delay },
});

const exitProps = (reduced: boolean | null) => ({
  exit: reduced ? {} : { opacity: 0, y: -8, filter: "blur(4px)" },
  transition: EXIT_SPRING,
});

const App: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cakeBlownOut, setCakeBlownOut] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>(loadPersistedWishes);
  const [newWishText, setNewWishText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedCard, setSelectedCard] = useState<CarouselItem | null>(null);

  const confettiRef = useRef<ConfettiRef | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleCloseModal = useCallback(() => setSelectedCard(null), []);
  useFocusTrap(modalRef, selectedCard !== null, handleCloseModal);

  const handleBoxOpen = () => {
    setIsUnlocked(true);
    confettiRef.current?.explode(window.innerWidth / 2, window.innerHeight / 2);
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

    setWishes((prev) => {
      const updated = [newWish, ...prev];
      persistUserWishes(updated);
      return updated;
    });
    setNewWishText('');
    setAuthorName('');

    confettiRef.current?.explode(window.innerWidth / 2, window.innerHeight * 0.6);
  };

  return (
    <div className="app-viewport">
      {/* Confetti canvas — decorative, hidden from a11y tree */}
      <ConfettiCanvas ref={confettiRef} />

      {/* Starry Drift Background — decorative */}
      <div className="starry-backdrop" aria-hidden="true"></div>

      {/* Audio Theme Synthesizer Toggle */}
      <AudioTheme />

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          /* ── HERO INTRO SCREEN ── */
          <motion.main
            key="intro-screen"
            className="intro-screen"
            id="main-content"
            {...enterProps(prefersReduced)}
            {...exitProps(prefersReduced)}
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
          /* ── MAIN DASHBOARD ── */
          <motion.div
            key="main-board"
            className="main-board"
            {...enterProps(prefersReduced, 0.1)}
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
                {...enterProps(prefersReduced, 0.15)}
              >
                <h2 id="cake-section-title" className="section-title text-gradient">The Virtual Celebration</h2>
                <p className="section-desc">Make a wish on the interactive 3D birthday cake before the party begins.</p>
                <Cake3D onCakeBlownOut={handleCakeBlownOut} />
              </motion.section>

              {/* Interactive 3D Role Carousel */}
              <motion.section
                className="glass-panel"
                aria-labelledby="carousel-section-title"
                {...enterProps(prefersReduced, 0.25)}
              >
                <span id="carousel-section-title" className="sr-only">Memory Lanes & Roles</span>
                <MemoryCarousel3D onCardSelect={setSelectedCard} />
              </motion.section>

              {/* Wish Guestbook Board */}
              <motion.section
                className="glass-panel wish-board-section"
                aria-labelledby="guestbook-title"
                {...enterProps(prefersReduced, 0.35)}
              >
                <h2 id="guestbook-title" className="section-title text-gradient">Birthday Guestbook</h2>
                <p className="section-desc">
                  {cakeBlownOut
                    ? "The magic is active! Add your special birthday note below."
                    : "Blow out all the candles on the cake to unlock the guestbook form."}
                </p>

                {/* Form — unlocked after cake candles are blown out */}
                <AnimatePresence>
                  {cakeBlownOut && (
                    <motion.div
                      className="wish-form-panel"
                      initial={prefersReduced ? {} : { opacity: 0, height: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, height: "auto", y: 0, filter: "blur(0px)" }}
                      exit={prefersReduced ? {} : { opacity: 0, height: 0, y: -4, filter: "blur(4px)" }}
                      transition={ENTER_SPRING}
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
                          Leave a Wish
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
                      initial={prefersReduced ? {} : { opacity: 0, scale: 0.96, y: 8, filter: "blur(3px)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ ...ENTER_SPRING, delay: 0.08 + index * 0.04 }}
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
                Made with <span className="heart" aria-label="love">&#10084;&#65039;</span> for a wonderful partner and friend.
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Card Details Modal with Focus Trap ── */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="card-modal-backdrop"
            onClick={handleCloseModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="card-modal-content"
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={prefersReduced ? { scale: 1 } : { opacity: 0, scale: 0.94, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={prefersReduced ? { scale: 1 } : { opacity: 0, scale: 0.96, y: 6, filter: "blur(4px)" }}
              transition={ENTER_SPRING}
            >
              <button
                className="close-modal-btn"
                onClick={handleCloseModal}
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
    </div>
  );
};

export default App;
