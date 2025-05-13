
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RewardBankProps {
  totalRewardTime?: number;
}

const RewardBank = ({ totalRewardTime }: RewardBankProps) => {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["user-stats-reward", user?.id],
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
  
  // Use props value if provided, otherwise use from Supabase
  const rewardTime = totalRewardTime !== undefined 
    ? totalRewardTime 
    : (userStats?.total_reward_time || 0);
  
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
