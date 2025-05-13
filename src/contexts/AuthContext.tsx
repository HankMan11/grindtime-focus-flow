
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
}

export interface UserProfile {
  username: string;
  avatar_url: string;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  userProfile: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    console.log("AuthProvider initializing");
    
    const setupAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Fetch user profile from localStorage
              const storedProfile = localStorage.getItem(`profile-${session.user.id}`);
              if (storedProfile) {
                console.log("Found stored profile for user", session.user.id);
                const profile = JSON.parse(storedProfile);
                
                // Auto-capitalize username if it exists
                if (profile.username) {
                  profile.username = capitalizeUsername(profile.username);
                }
                
                setUserProfile(profile);
              } else {
                console.log("No stored profile found for user", session.user.id);
                setUserProfile(null);
              }
            } else {
              setUserProfile(null);
            }
            
            setIsLoading(false);
          }
        );

        // THEN check for existing session
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session?.user?.id);
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          // Fetch user profile from localStorage
          const storedProfile = localStorage.getItem(`profile-${data.session.user.id}`);
          if (storedProfile) {
            console.log("Found stored profile for user", data.session.user.id);
            const profile = JSON.parse(storedProfile);
            
            // Auto-capitalize username if it exists
            if (profile.username) {
              profile.username = capitalizeUsername(profile.username);
            }
            
            setUserProfile(profile);
          } else {
            console.log("No stored profile found for user", data.session.user.id);
          }
        }
        
        setIsLoading(false);
        
        return () => {
          console.log("Cleaning up auth subscription");
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in auth setup:", error);
        setIsLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  // Function to capitalize username
  const capitalizeUsername = (username: string): string => {
    return username
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
