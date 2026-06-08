import { useEffect, useRef } from "react";
import { useAnimate, stagger } from "framer-motion";
import { pageMarkup } from "./pageMarkup";

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function App() {
  const behaviorLoaded = useRef(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    window.lucide?.createIcons();

    if (!behaviorLoaded.current) {
      behaviorLoaded.current = true;
      void import("./app");
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    void animate(
      ".site-header",
      { opacity: [0, 1], y: [-18, 0], filter: ["blur(10px)", "blur(0px)"] },
      { duration: 0.62, ease: easeOut }
    );

    void animate(
      ".hero-copy .eyebrow-badge, .hero-copy h1, .hero-copy .lede, .hero-actions",
      { opacity: [0, 1], y: [28, 0], filter: ["blur(14px)", "blur(0px)"] },
      { duration: 0.78, delay: stagger(0.1, { startDelay: 0.12 }), ease: easeOut }
    );

    void animate(
      ".hero-visual",
      { opacity: [0, 1], x: [42, 0], scale: [0.965, 1], filter: ["blur(18px)", "none"] },
      { duration: 0.9, delay: 0.28, ease: easeOut }
    );

    void animate(
      ".mini-flow-diagram .flow-step, .mini-flow-diagram .flow-arrow",
      { opacity: [0, 1], y: [10, 0], filter: ["blur(10px)", "none"] },
      { duration: 0.46, delay: stagger(0.045, { startDelay: 0.58 }), ease: easeOut }
    );

    void animate(
      ".payment-card",
      { opacity: [0, 1], y: [24, 0], rotate: [-1.2, 0], filter: ["blur(12px)", "none"] },
      { duration: 0.72, delay: 0.56, ease: easeOut }
    );

    window.setTimeout(() => {
      scope.current?.setAttribute("data-hero-motion-complete", "true");
    }, 1150);

    const revealGroups = [
      {
        root: ".how-it-works-section",
        kind: "steps"
      },
      {
        root: ".checkout-section",
        kind: "demo"
      },
      {
        root: ".builders-section",
        kind: "builders"
      },
      {
        root: ".faq-section",
        kind: "faq"
      },
      {
        root: ".site-footer",
        kind: "footer"
      }
    ];

    const revealSection = (kind: string) => {
      if (kind === "steps") {
        void animate(
          ".how-it-works-section .section-heading",
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 0.62, ease: easeOut }
        );
        void animate(
          ".how-it-works-section .notched-card",
          { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" },
          { duration: 0.74, delay: stagger(0.11, { startDelay: 0.16 }), ease: easeOut }
        );
        return;
      }

      if (kind === "demo") {
        void animate(
          ".checkout-section .section-heading",
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 0.6, ease: easeOut }
        );
        void animate(
          ".checkout-section .checkout-column:first-child",
          { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
          { duration: 0.76, delay: 0.12, ease: easeOut }
        );
        void animate(
          ".checkout-section .checkout-column:last-child",
          { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
          { duration: 0.76, delay: 0.24, ease: easeOut }
        );
        void animate(
          ".checkout-section .dev-timeline-step",
          { opacity: 1, x: 0 },
          { duration: 0.42, delay: stagger(0.06, { startDelay: 0.46 }), ease: easeOut }
        );
        return;
      }

      if (kind === "builders") {
        void animate(
          ".builders-section .builders-header",
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 0.62, ease: easeOut }
        );
        void animate(
          ".builders-section .builder-capability",
          { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          { duration: 0.52, delay: stagger(0.07, { startDelay: 0.18 }), ease: easeOut }
        );
        void animate(
          ".builders-section .builder-fix-card",
          { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          { duration: 0.7, delay: 0.46, ease: easeOut }
        );
        return;
      }

      if (kind === "faq") {
        void animate(
          ".faq-section .faq-heading",
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 0.58, ease: easeOut }
        );
        void animate(
          ".faq-section .faq-item",
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)" },
          { duration: 0.58, delay: stagger(0.075, { startDelay: 0.16 }), ease: easeOut }
        );
        return;
      }

      void animate(
        ".site-footer",
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        { duration: 0.68, ease: easeOut }
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.hasAttribute("data-motion-seen")) {
            return;
          }

          entry.target.setAttribute("data-motion-seen", "true");
          const group = revealGroups.find(({ root }) => entry.target.matches(root));

          if (!group) {
            return;
          }

          revealSection(group.kind);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    revealGroups.forEach(({ root }) => {
      const element = scope.current?.querySelector(root);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [animate]);

  return <div ref={scope} dangerouslySetInnerHTML={{ __html: pageMarkup }} />;
}
