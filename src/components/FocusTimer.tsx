
import { useState, useEffect } from "react";
import useTimer from "@/hooks/useTimer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Timer, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface FocusTimerProps {
  onComplete?: (focusDuration: number) => void;
}

const FocusTimer = ({ onComplete }: FocusTimerProps) => {
  const [activeTab, setActiveTab] = useState<"focus" | "reward">("focus");
  const { user } = useAuth();
  const [focusDuration, setFocusDuration] = useState(25);
  
  // Fetch user stats from Supabase
  const { data: userStats, refetch } = useQuery({
    queryKey: ["timer-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_stats")
        .select("total_reward_time")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user stats:", error);
        return { total_reward_time: 0 };
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Calculate rewards (5 min focus = 1 min reward)
  const calculateReward = (focusMinutes: number) => Math.floor(focusMinutes / 5);
  
  // Focus timer settings
  const focusTimer = useTimer({
    initialMinutes: focusDuration,
    onComplete: async () => {
      // Calculate reward time
      const newRewardTime = calculateReward(focusDuration);
      
      // Update stats when focus session completes
      if (user) {
        const { error } = await supabase
          .from("user_stats")
          .update({
            total_focus_time: supabase.rpc('increment', { x: focusDuration }),
            total_reward_time: supabase.rpc('increment', { x: newRewardTime }),
            sessions_completed: supabase.rpc('increment', { x: 1 })
          })
          .eq("user_id", user.id);
          
        if (error) {
          console.error("Error updating user stats:", error);
        } else {
          // Refetch stats after update
          refetch();
        }
      }
      
      toast({
        title: "Focus Session Complete!",
        description: `You earned ${newRewardTime} minutes of reward time!`,
      });
      
      if (onComplete) onComplete(focusDuration);
    }
  });
  
  // Reward timer settings
  const rewardTimer = useTimer({
    initialMinutes: 5
  });
  
  // Set up durations
  const focusDurations = [5, 15, 25, 45];
  const rewardDurations = [5, 10, 15, 20];
  
  // Active timer based on tab
  const activeTimer = activeTab === "focus" ? focusTimer : rewardTimer;
  
  const handleStartFocus = () => {
    focusTimer.startTimer();
  };
  
  const handleStartReward = async () => {
    const availableRewardTime = userStats?.total_reward_time || 0;
    
    if (availableRewardTime <= 0) {
      toast({
        title: "No Reward Time Available",
        description: "Complete focus sessions to earn reward time.",
        variant: "destructive",
      });
      return;
    }
    
    const rewardDuration = rewardTimer.initialMinutes;
    
    if (rewardDuration > availableRewardTime) {
      toast({
        title: "Not Enough Reward Time",
        description: `You only have ${availableRewardTime} minutes available.`,
        variant: "destructive",
      });
      return;
    }
    
    // Start the reward timer
    rewardTimer.startTimer();
    
    // Deduct time from available reward time
    if (user) {
      const { error } = await supabase
        .from("user_stats")
        .update({
          total_reward_time: supabase.rpc('decrement', { x: rewardDuration })
        })
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Error updating reward time:", error);
      } else {
        // Refetch stats after update
        refetch();
      }
    }
  };
  
  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Timer</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span>Available Reward: {userStats?.total_reward_time || 0} mins</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="focus" value={activeTab} onValueChange={(value) => setActiveTab(value as "focus" | "reward")} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="focus">Focus Time</TabsTrigger>
            <TabsTrigger value="reward">Reward Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="focus" className="mt-0">
            <div className="flex flex-col items-center">
              {!focusTimer.isActive && (
                <div className="mb-4 flex flex-wrap gap-2 justify-center">
                  {focusDurations.map(duration => (
                    <Button 
                      key={duration} 
                      variant={focusDuration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFocusDuration(duration);
                        focusTimer.setTimerDuration(duration);
                      }}
                    >
                      {duration} min
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="timer-display my-6">
                {focusTimer.formattedTime}
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2 mb-8">
                <div 
                  className="bg-gradient-to-r from-grindtime-green to-grindtime-blue h-2 rounded-full" 
                  style={{ width: `${focusTimer.progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-center gap-3">
                {!focusTimer.isActive ? (
                  <Button className="px-8" onClick={handleStartFocus}>
                    <Play className="mr-2 h-4 w-4" /> Start Focus
                  </Button>
                ) : !focusTimer.isPaused ? (
                  <Button variant="outline" onClick={focusTimer.pauseTimer}>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button variant="default" onClick={focusTimer.resumeTimer}>
                    <Play className="mr-2 h-4 w-4" /> Resume
                  </Button>
                )}
                
                {(focusTimer.isActive || focusTimer.timeLeft < focusDuration * 60) && (
                  <Button variant="destructive" onClick={focusTimer.resetTimer}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reward" className="mt-0">
            <div className="flex flex-col items-center">
              {!rewardTimer.isActive && (
                <div className="mb-4 flex flex-wrap gap-2 justify-center">
                  {rewardDurations.map(duration => (
                    <Button 
                      key={duration} 
                      variant="outline"
                      size="sm"
                      disabled={!userStats || userStats.total_reward_time < duration}
                      onClick={() => {
                        rewardTimer.setTimerDuration(duration);
                      }}
                    >
                      {duration} min
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="timer-display my-6">
                {rewardTimer.formattedTime}
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2 mb-8">
                <div 
                  className="bg-gradient-to-r from-grindtime-purple to-grindtime-blue h-2 rounded-full" 
                  style={{ width: `${rewardTimer.progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-center gap-3">
                {!rewardTimer.isActive ? (
                  <Button 
                    className="px-8 bg-grindtime-purple hover:bg-grindtime-purple/90" 
                    onClick={handleStartReward}
                    disabled={!userStats || userStats.total_reward_time <= 0}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" /> Start Reward
                  </Button>
                ) : !rewardTimer.isPaused ? (
                  <Button variant="outline" onClick={rewardTimer.pauseTimer}>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button 
                    className="bg-grindtime-purple hover:bg-grindtime-purple/90" 
                    onClick={rewardTimer.resumeTimer}
                  >
                    <Play className="mr-2 h-4 w-4" /> Resume
                  </Button>
                )}
                
                {(rewardTimer.isActive || rewardTimer.timeLeft < rewardTimer.initialMinutes * 60) && (
                  <Button variant="destructive" onClick={rewardTimer.resetTimer}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FocusTimer;
