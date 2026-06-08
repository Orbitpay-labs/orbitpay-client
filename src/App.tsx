import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pageMarkup } from "./pageMarkup";

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

function IntroSplash() {
  return (
    <motion.div
      className="intro-splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -18, filter: "blur(14px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="intro-panel"
        initial={{ scale: 0.92, borderRadius: 44 }}
        animate={{ scale: 1, borderRadius: 34 }}
        transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="intro-mark"
          initial={{ opacity: 0, scale: 0.72, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.08, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">
            <path
              d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        <motion.div
          className="intro-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>OrbitPay Labs</span>
          <strong>Stellar checkout kit</strong>
        </motion.div>
        <motion.div
          className="intro-loader"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.52, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const behaviorLoaded = useRef(false);

  useEffect(() => {
    window.lucide?.createIcons();

    if (!behaviorLoaded.current) {
      behaviorLoaded.current = true;
      void import("./app");
    }

    const timer = window.setTimeout(() => setShowIntro(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{showIntro ? <IntroSplash /> : null}</AnimatePresence>
      <div dangerouslySetInnerHTML={{ __html: pageMarkup }} />
    </>
  );
}
