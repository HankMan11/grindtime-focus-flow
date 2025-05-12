
import { useState, useEffect } from "react";
import useTimer from "@/hooks/useTimer";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Timer, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface FocusTimerProps {
  onComplete?: () => void;
}

interface FocusStats {
  totalFocusTime: number; // in minutes
  totalRewardTime: number; // in minutes
  sessionsCompleted: number;
}

const FocusTimer = ({ onComplete }: FocusTimerProps) => {
  const [activeTab, setActiveTab] = useState<"focus" | "reward">("focus");
  const [stats, setStats] = useLocalStorage<FocusStats>("grindtime-stats", {
    totalFocusTime: 0,
    totalRewardTime: 0,
    sessionsCompleted: 0,
  });
  
  // Calculate rewards (5 min focus = 1 min reward)
  const calculateReward = (focusMinutes: number) => Math.floor(focusMinutes / 5);
  
  // Focus timer settings
  const [focusDuration, setFocusDuration] = useState(25);
  const focusTimer = useTimer({
    initialMinutes: focusDuration,
    onComplete: () => {
      // Update stats when focus session completes
      const newRewardTime = calculateReward(focusDuration);
      setStats(prev => ({
        ...prev,
        totalFocusTime: prev.totalFocusTime + focusDuration,
        totalRewardTime: prev.totalRewardTime + newRewardTime,
        sessionsCompleted: prev.sessionsCompleted + 1,
      }));
      
      toast({
        title: "Focus Session Complete!",
        description: `You earned ${newRewardTime} minutes of reward time!`,
      });
      
      if (onComplete) onComplete();
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
  
  const handleStartReward = () => {
    if (stats.totalRewardTime <= 0) {
      toast({
        title: "No Reward Time Available",
        description: "Complete focus sessions to earn reward time.",
        variant: "destructive",
      });
      return;
    }
    
    rewardTimer.startTimer();
    
    // Deduct time from available reward time
    setStats(prev => ({
      ...prev,
      totalRewardTime: Math.max(0, prev.totalRewardTime - 5),
    }));
  };
  
  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Timer</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span>Available Reward: {stats.totalRewardTime} mins</span>
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
                      disabled={stats.totalRewardTime < duration}
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
                    disabled={stats.totalRewardTime <= 0}
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
                
                {(rewardTimer.isActive || rewardTimer.timeLeft < 5 * 60) && (
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
