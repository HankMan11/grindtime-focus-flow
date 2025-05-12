
import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import FocusTimer from "@/components/FocusTimer";
import StreakDisplay from "@/components/StreakDisplay";
import StatsCard from "@/components/StatsCard";
import HomeworkLogger from "@/components/HomeworkLogger";
import RewardBank from "@/components/RewardBank";
import useStreak from "@/hooks/useStreak";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { currentStreak, longestStreak, dailyGoalMet, markDailyGoalComplete } = useStreak();
  const [stats, setStats] = useLocalStorage("grindtime-stats", {
    totalFocusTime: 0,
    totalRewardTime: 0,
    sessionsCompleted: 0,
    homeworkLogged: 0,
  });

  // Handle timer completion - update streak
  const handleSessionComplete = () => {
    markDailyGoalComplete();
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Welcome to GrindTime</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <FocusTimer onComplete={handleSessionComplete} />
          <HomeworkLogger />
        </div>
        
        <div className="space-y-6">
          <RewardBank />
          <StreakDisplay 
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            dailyGoalMet={dailyGoalMet}
          />
          <StatsCard />
        </div>
      </div>
      
      <Card className="mt-8 bg-grindtime-blue/10">
        <CardContent className="p-4 text-center">
          <p className="mb-2 text-sm">
            GrindTime helps you balance productivity and rewards.
            Complete focus sessions to earn social media time!
          </p>
          <div className="flex justify-center">
            <Button 
              variant="link"
              className="text-grindtime-blue" 
              onClick={() => window.open("https://docs.grindtime.app", "_blank")}
            >
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Index;
