
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Award, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserStats {
  total_focus_time: number;
  total_reward_time: number;
  sessions_completed: number;
  homework_logged: number;
}

const StatsPage = () => {
  const { user } = useAuth();
  
  // Fetch user stats from Supabase
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user stats:", error);
        return null;
      }
      
      return data as UserStats;
    },
    enabled: !!user,
  });
  
  const formatTime = (minutes: number) => {
    if (!minutes) return "0 mins";
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Prepare chart data
  const chartData = [
    { name: "Focus", time: stats?.total_focus_time || 0 },
    { name: "Reward", time: stats?.total_reward_time || 0 }
  ];
  
  // Prepare weekly focus data (example - in a real app, this would come from your database)
  const weeklyData = [
    { name: "Mon", minutes: 25 },
    { name: "Tue", minutes: 45 },
    { name: "Wed", minutes: 30 },
    { name: "Thu", minutes: 60 },
    { name: "Fri", minutes: 15 },
    { name: "Sat", minutes: 40 },
    { name: "Sun", minutes: 55 },
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-grindtime-blue" />
              Focus Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{isLoading ? "..." : formatTime(stats?.total_focus_time || 0)}</p>
            <p className="text-xs text-muted-foreground">Total focused study time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Timer className="h-4 w-4 text-grindtime-purple" />
              Reward Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{isLoading ? "..." : formatTime(stats?.total_reward_time || 0)}</p>
            <p className="text-xs text-muted-foreground">Total earned rewards</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Award className="h-4 w-4 text-grindtime-green" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{isLoading ? "..." : stats?.sessions_completed || 0}</p>
            <p className="text-xs text-muted-foreground">Focus sessions completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <span className="font-sans">📝</span>
              Homework
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{isLoading ? "..." : stats?.homework_logged || 0}</p>
            <p className="text-xs text-muted-foreground">Assignments logged</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Study Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} min`, 'Focus Time']}
                labelFormatter={(value) => `${value}`}
              />
              <Bar 
                dataKey="minutes" 
                fill="#4F46E5" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatTime(value), 'Time']}
                labelFormatter={(value) => `${value} Time`}
              />
              <Bar 
                dataKey="time" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsPage;
