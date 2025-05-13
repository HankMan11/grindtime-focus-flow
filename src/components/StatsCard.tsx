
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Award, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Stats {
  total_focus_time: number; // in minutes
  total_reward_time: number; // in minutes
  sessions_completed: number;
  homework_logged: number;
}

const StatsCard = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-card", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user stats:", error);
        return {
          total_focus_time: 0,
          total_reward_time: 0,
          sessions_completed: 0,
          homework_logged: 0
        };
      }
      
      return data as Stats;
    },
    enabled: !!user,
  });
  
  const formatTime = (minutes: number = 0) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-grindtime-blue" />
            Focus Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">
            {isLoading ? "..." : formatTime(stats?.total_focus_time || 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-grindtime-green" />
            Reward Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">
            {isLoading ? "..." : formatTime(stats?.total_reward_time || 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Award className="h-4 w-4 text-grindtime-purple" />
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">
            {isLoading ? "..." : stats?.sessions_completed || 0}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <span className="font-sans">📝</span>
            Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">
            {isLoading ? "..." : stats?.homework_logged || 0}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
