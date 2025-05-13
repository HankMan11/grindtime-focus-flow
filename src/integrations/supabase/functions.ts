
import { supabase } from "./client";

// Function to create a new user stat record if it doesn't exist
export const ensureUserStats = async (userId: string) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
    
  if (error) {
    console.error("Error checking user stats:", error);
    return null;
  }
  
  if (!data) {
    // Create new stats record
    const { data: newStats, error: insertError } = await supabase
      .from("user_stats")
      .insert({
        user_id: userId,
        total_focus_time: 0,
        total_reward_time: 0,
        sessions_completed: 0,
        homework_logged: 0
      })
      .select()
      .single();
      
    if (insertError) {
      console.error("Error creating user stats:", insertError);
      return null;
    }
    
    return newStats;
  }
  
  return data;
};

// Function to increment a specific field in user stats
export const incrementUserStat = async (
  userId: string,
  field: string,
  amount: number
) => {
  if (!userId) return;
  
  // Ensure user stats exist
  await ensureUserStats(userId);
  
  // Update the specified field
  const { error } = await supabase
    .from("user_stats")
    .update({ [field]: supabase.rpc('increment', { x: amount }) })
    .eq("user_id", userId);
    
  if (error) {
    console.error(`Error incrementing ${field}:`, error);
  }
};
