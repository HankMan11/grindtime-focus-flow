
import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";
import { toast } from "@/components/ui/use-toast";

interface StreakData {
  currentStreak: number;
  lastLoginDate: string | null;
  longestStreak: number;
  dailyGoalMet: boolean;
}

const useStreak = () => {
  const [streakData, setStreakData] = useLocalStorage<StreakData>("grindtime-streak", {
    currentStreak: 0,
    lastLoginDate: null,
    longestStreak: 0,
    dailyGoalMet: false,
  });

  // Check and update streak on component mount
  useEffect(() => {
    updateStreak();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStreak = useCallback(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!streakData.lastLoginDate) {
      // First time user
      setStreakData({
        ...streakData,
        lastLoginDate: todayStr,
      });
      return;
    }
    
    if (streakData.lastLoginDate === todayStr) {
      // Already logged in today
      return;
    }

    const lastLogin = new Date(streakData.lastLoginDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLogin.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      // Consecutive login - increment streak
      const newStreak = streakData.currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, streakData.longestStreak);
      
      setStreakData({
        ...streakData,
        currentStreak: newStreak,
        lastLoginDate: todayStr,
        longestStreak: newLongestStreak,
        dailyGoalMet: false, // Reset daily goal for new day
      });

      if (newStreak > 1) {
        toast({
          title: `${newStreak} Day Streak!`,
          description: "Keep up the good work!",
        });
      }
    } else if (lastLogin < yesterday) {
      // Missed a day - reset streak
      setStreakData({
        ...streakData,
        currentStreak: 1, // Start fresh
        lastLoginDate: todayStr,
        dailyGoalMet: false, // Reset daily goal for new day
      });
    }
  }, [streakData, setStreakData]);

  const markDailyGoalComplete = useCallback(() => {
    if (!streakData.dailyGoalMet) {
      setStreakData({
        ...streakData,
        dailyGoalMet: true,
      });
      
      toast({
        title: "Daily Goal Completed!",
        description: "You've met your daily study goal!",
      });
    }
  }, [streakData, setStreakData]);

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    dailyGoalMet: streakData.dailyGoalMet,
    updateStreak,
    markDailyGoalComplete,
  };
};

export default useStreak;
