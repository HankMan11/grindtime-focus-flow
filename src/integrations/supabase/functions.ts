
import { supabase } from './client';

// Type definition for allowed field names
type UserStatField = "total_focus_time" | "total_reward_time" | "sessions_completed" | "homework_logged";

// Check if user stats exist and create if they don't
export const ensureUserStats = async (userId: string) => {
  if (!userId) return;
  
  // First check if user stats already exist
  const { data, error } = await supabase
    .from('user_stats')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  // If no stats are found, create them
  if (error && error.code === 'PGRST116') {
    // This error means no rows returned = no stats found
    const { error: insertError } = await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_focus_time: 0,
        total_reward_time: 0,
        sessions_completed: 0,
        homework_logged: 0,
      });
    
    if (insertError) {
      console.error('Error creating user stats:', insertError);
    }
  } else if (error) {
    console.error('Error checking for user stats:', error);
  }
};

// Function to increment a specific field in user stats
export const incrementUserStat = async (
  userId: string,
  field: UserStatField,
  amount: number
) => {
  if (!userId) return;
  
  // Ensure user stats exist before incrementing
  await ensureUserStats(userId);

  // Using the increment function in a type-safe manner
  const { error } = await supabase
    .from("user_stats")
    .update({ [field]: amount })
    .eq('user_id', userId);
  
  if (error) {
    console.error(`Error incrementing ${field}:`, error);
  }
  
  return !error;
};

// Get all stats for a user
export const getUserStats = async (userId: string) => {
  if (!userId) return null;
  
  // Ensure user stats exist
  await ensureUserStats(userId);
  
  // Get the stats
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
  
  return data;
};
