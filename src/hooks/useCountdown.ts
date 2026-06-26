"use client";

import { useState, useEffect } from "react";

export function useCountdown(expiresAt: string) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isExpired = secondsLeft === 0;

  return { secondsLeft, formatted, isExpired };
}