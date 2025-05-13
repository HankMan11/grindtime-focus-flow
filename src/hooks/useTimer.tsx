
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

interface TimerOptions {
  initialMinutes?: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

const useTimer = ({ initialMinutes = 25, onComplete, autoStart = false }: TimerOptions = {}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  // Format time as MM:SS
  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);
  
  // Start timer
  const startTimer = useCallback(() => {
    if (timeLeft <= 0) return;
    setIsActive(true);
    setIsPaused(false);
    toast({
      title: "Focus Timer Started",
      description: `Stay focused for ${initialMinutes} minutes!`,
    });
  }, [timeLeft, initialMinutes]);
  
  // Pause timer
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  // Resume timer
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  // Reset timer
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(initialMinutes * 60);
  }, [initialMinutes]);
  
  // Set custom timer duration
  const setTimerDuration = useCallback((seconds: number) => {
    setTimeLeft(seconds);
  }, []);
  
  // Progress percentage
  const progressPercentage = ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100;
  
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            if (onComplete) onComplete();
            toast({
              title: "Focus Session Complete!",
              description: `Great job! You've earned some reward time.`,
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, onComplete]);
  
  return {
    timeLeft,
    isActive,
    isPaused,
    formattedTime: formatTime(),
    progressPercentage,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimerDuration,
  };
};

export default useTimer;
