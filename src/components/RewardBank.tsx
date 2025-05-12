
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Timer } from "lucide-react";

interface RewardBankProps {
  totalRewardTime?: number;
}

const RewardBank = ({ totalRewardTime }: RewardBankProps) => {
  const [stats] = useLocalStorage("grindtime-stats", {
    totalFocusTime: 0,
    totalRewardTime: 0,
    sessionsCompleted: 0,
  });
  
  // Use props value if provided, otherwise use from localStorage
  const rewardTime = totalRewardTime !== undefined ? totalRewardTime : stats.totalRewardTime;
  
  // Calculate the progress percentage (max 100 minutes for display purposes)
  const progressPercentage = Math.min(100, (rewardTime / 100) * 100);
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Timer className="h-5 w-5 mr-2 text-grindtime-purple" />
          Reward Bank
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-3xl font-bold">{rewardTime}</p>
            <p className="text-xs text-muted-foreground">minutes available</p>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Every 5 mins focus = 1 min reward</p>
        </div>
        
        <div className="w-full">
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardBank;
