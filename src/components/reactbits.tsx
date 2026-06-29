"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

export function BlurText({
  text,
  className = "",
  animateBy = "words",
  delay = 80,
}: {
  text: string;
  className?: string;
  animateBy?: "words" | "letters";
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const segments = animateBy === "words" ? text.split(" ") : text.split("");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          className="inline-block"
          style={{
            animation: visible ? "blur-in 0.7s ease forwards" : "none",
            animationDelay: visible ? `${index * delay}ms` : "0ms",
            opacity: visible ? undefined : 0,
            filter: visible ? undefined : "blur(12px)",
            transform: visible ? undefined : "translateY(12px)",
          }}
        >
          {segment}
          {animateBy === "words" && index < segments.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

export function AnimatedContent({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform = {
    up: "translateY(28px)",
    down: "translateY(-28px)",
    left: "translateX(28px)",
    right: "translateX(-28px)",
  }[direction];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : hiddenTransform,
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onMouseMove={handleMove} className={`group relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl"
          style={{ left: "var(--spotlight-x, 50%)", top: "var(--spotlight-y, 50%)" }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-blue-300 via-blue-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift ${className}`}>
      {children}
    </span>
  );
}

export function GlareHover({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute -inset-full z-20 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
      {children}
    </div>
  );
}

export function CountUp({ to, suffix = "", className = "", duration = 1800 }: { to: number; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
