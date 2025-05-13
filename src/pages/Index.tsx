
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import FocusTimer from "@/components/FocusTimer";
import StreakDisplay from "@/components/StreakDisplay";
import StatsCard from "@/components/StatsCard";
import HomeworkLogger from "@/components/HomeworkLogger";
import RewardBank from "@/components/RewardBank";
import Calendar from "@/components/Calendar";
import StatsPage from "@/components/StatsPage";
import useStreak from "@/hooks/useStreak";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { currentStreak, longestStreak, dailyGoalMet, markDailyGoalComplete } = useStreak();
  const { userProfile, user } = useAuth();
  
  // Handle timer completion - update streak and user stats
  const handleSessionComplete = async (focusDuration: number) => {
    // Mark daily goal complete for streak
    markDailyGoalComplete();
    
    // Update user stats in Supabase
    if (user) {
      try {
        // Using proper increment function with typed parameters
        const { error } = await supabase
          .from("user_stats")
          .update({
            total_focus_time: focusDuration,
            total_reward_time: Math.floor(focusDuration / 5),
            sessions_completed: 1
          })
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Error updating user stats:", error);
        }
      } catch (error) {
        console.error("Error in session completion:", error);
      }
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">
        Welcome{userProfile?.username ? `, ${userProfile.username}` : " to GrindTime"}
      </h1>
      
      <Tabs defaultValue="calendar">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
          <TabsTrigger value="timer" className="flex-1">Focus Timer</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">Calendar</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
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
        </TabsContent>
        
        <TabsContent value="timer">
          <div className="max-w-md mx-auto">
            <FocusTimer onComplete={handleSessionComplete} />
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Calendar />
        </TabsContent>
        
        <TabsContent value="stats">
          <StatsPage />
        </TabsContent>
      </Tabs>
      
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
