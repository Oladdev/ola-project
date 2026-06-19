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
    text: "Happy birthday to the most supportive, structured, and brilliant friend Babcock gave to me! Hope this year brings you endless joy and brings you closer to discovering yourself and your dreams.",
    author: "Ola",
    date: "June 19",
  },
  {
    id: 2,
    text: "Umm hi This is michael ur day one ... just want to wish you a happy birthday... long life more money wisdom growth ... and I've greatest pleasure of knowing you.... thank you for bringing out the best in me your friend Michael 💯💯",
    author: "Micheal",
    date: "June 19",
  },
  {
    id: 3,
    text: "Happy Birthday Ritaaaa \n\n Long life and prosperity  💕\n\n Quiet-ish queeennnnn 👑✨\n\n I hope God grants every wish that that little child in you desires 🥹 We don't talk a lot but we connect in our brain 😂",
    author: "Odulate Daniel",
    date: "June 19",
  },
  {
    id: 4,
    text: "Happy birthday Rita \n\n You're the best",
    author: "Young Arney",
    date: "June 19",
  },
  {
    id: 5,
    text: "Happy Birthday to our Course Rep! You can be quite the menace sometimes, but credit where it's due. You've been helpful and supportive when it mattered. Wishing you a great birthday, more success, good health, and plenty of reasons to smile this year. Enjoy your day and have a blast!",
    author: "Desmond Jubilee",
    date: "June 19",
  },
  {
    id: 6,
    text: "To one of the most intelligent persons I know. Your dedication, leadership, and willingness to serve the class do not go unnoticed. Thank you for always stepping up, keeping everyone informed, and helping make things run smoothly. Happy birthday Rita!",
    author: "Solomon",
    date: "June 19",
  },
  {
    id: 7,
    text: "To Rita,\n\nHappy birthday girl, cheers to the new age. I pray for more grace and favors over your life.",
    author: "Blessed",
    date: "June 19",
  },
  {
    id: 8,
    text: "Birthday day wish: I wish she would grow to be a wonderful woman that loves God and will make impact on people and other people close to her.",
    author: "Ledor",
    date: "June 19",
  },
  {
    id: 9,
    text: "Birthday day wish: I wish she would grow to be a wonderful woman that loves God and will make impact on people and other people close to her.",
    author: "Okara David",
    date: "June 19",
  },
  {
    id: 10,
    text: "Happy Birthday Rita, we really appreciate you🎉, hope you have a good one🥳",
    author: "Eguabor Joseph",
    date: "June 19",
  },
  {
    id: 11,
    text: "Happppyy birthday Rita, wishing you long life and prosperity ❤️ i’m grateful for all time you and Ola collected my assignments after the deadline 😂💕",
    author: "Chimax",
    date: "June 19",
  },
  {
    id: 12,
    text: "Happy Birthday!\n\n Omo, Rita, I can’t even lie, you’re one of those quiet people that somehow ends up being one of the funniest in the room. It’s barely a surprise anymore how you can just carry a whole group project like it’s nothing, I’ve seen it first hand, so no one can argue that. Honestly, from group work stress to random chats, it’s just simply a good time with you. You’re lowkey one of the most reliable people I know.I hope this year brings you more wins, in class, in life, and of course on eFootball (even though I might still beat you 👀).\n\n Enjoy your day girl, (dem no dey “baby girl” Oga),you deserve it! 🎂🎈",
    author: "Zemhe",
    date: "June 19",
  },
  {
    id: 13,
    text: "Happy birthday Rits❤️🎉🎂🥳🎊🎊\n\n You've helped me a lot and would never give off a vibe that I'm disturbing you even when I am😭\n\nI'm glad God has kept you to see this new age that you'll hopefully tell me 😂 and I pray He keeps you in good health and wealth to see many more IJN Amen\n\nSeeing you play table tennis made me genuinely glad 😊, let's play again sometime",
    author: "Imade",
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
  const [showFunnyPopup, setShowFunnyPopup] = useState(false);

  const confettiRef = useRef<ConfettiRef | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const funnyModalRef = useRef<HTMLDivElement>(null);

  const handleCloseModal = useCallback(() => setSelectedCard(null), []);
  useFocusTrap(modalRef, selectedCard !== null, handleCloseModal);
  useFocusTrap(funnyModalRef, showFunnyPopup, () => setShowFunnyPopup(false));

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
    setShowFunnyPopup(true);

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
              {/* Interactive 3D Birthday Cake */}
              <motion.section
                className="glass-panel"
                aria-labelledby="cake-section-title"
                {...enterProps(prefersReduced, 0.15)}
              >
                <h2 id="cake-section-title" className="section-title text-gradient">The Virtual Celebration</h2>
                <p className="section-desc">Make a wish on the interactive 3D birthday cake before the party begins.</p>
                <Cake3D
                  onCakeBlownOut={handleCakeBlownOut}
                  authorName={authorName}
                  setAuthorName={setAuthorName}
                  newWishText={newWishText}
                  setNewWishText={setNewWishText}
                  handleWishSubmit={handleWishSubmit}
                />
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
                Made with <span className="heart" aria-label="love">&#10084;&#65039;</span> for an amazing assistant and friend.
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

      {/* ── Funny Popup Modal with Focus Trap ── */}
      <AnimatePresence>
        {showFunnyPopup && (
          <motion.div
            className="card-modal-backdrop"
            onClick={() => setShowFunnyPopup(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="card-modal-content"
              ref={funnyModalRef}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="funny-modal-title"
              initial={prefersReduced ? { scale: 1 } : { opacity: 0, scale: 0.94, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={prefersReduced ? { scale: 1 } : { opacity: 0, scale: 0.96, y: 6, filter: "blur(4px)" }}
              transition={ENTER_SPRING}
            >
              <button
                className="close-modal-btn"
                onClick={() => setShowFunnyPopup(false)}
                aria-label="Close funny dialog"
              >
                &times;
              </button>
              <div className="modal-emoji-header" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                😜
              </div>
              <div className="modal-body-content" style={{ textAlign: 'center' }}>
                <h3 id="funny-modal-title" className="modal-title">Wish Submitted!</h3>
                <p className="modal-subtitle" style={{ fontSize: '1.25rem', color: '#f472b6', marginTop: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
                  doesn't work lol
                </p>
                <div className="modal-divider" />
                <p className="modal-description">
                  Your wish has been saved to the guestbook, but unfortunately, the virtual magic engine failed to process the reality shift. Try again next year! 🤡
                </p>
                <button
                  className="submit-btn"
                  onClick={() => setShowFunnyPopup(false)}
                  style={{ marginTop: '20px', width: '100%', maxWidth: '200px' }}
                >
                  Fair enough 😂
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
