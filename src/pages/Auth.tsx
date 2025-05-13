
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, UserPlus, ArrowRight, Rocket, Clock, LineChart } from "lucide-react";

// Form schema for login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Form schema for signup
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const slides = [
    {
      title: "Track Your Productivity",
      description: "Upload homework assignments and track your progress with our OCR technology.",
      icon: <Rocket className="h-16 w-16 text-grindtime-purple" />
    },
    {
      title: "Focus with Timers",
      description: "Use our focus timer to stay productive and earn social media time as a reward.",
      icon: <Clock className="h-16 w-16 text-grindtime-green" />
    },
    {
      title: "Track Your Growth",
      description: "View detailed statistics about your productivity and streaks.",
      icon: <LineChart className="h-16 w-16 text-grindtime-blue" />
    }
  ];

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Successfully signed up! Please check your email for verification.");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      // When on the last slide, show the auth form instead of moving to next slide
      setCurrentSlide(slides.length);
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  };

  const skipIntro = () => {
    setCurrentSlide(slides.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-md mx-auto">
        {currentSlide < slides.length ? (
          <div className="text-center mb-8 w-full">
            <div className="flex justify-between mb-8">
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`text-sm ${currentSlide === 0 ? 'invisible' : 'text-muted-foreground'}`}
              >
                Back
              </button>
              <button 
                onClick={skipIntro} 
                className="text-sm text-muted-foreground"
              >
                Skip
              </button>
            </div>
            
            <div className="flex justify-center mb-6">
              {slides[currentSlide].icon}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-muted-foreground mb-8">
              {slides[currentSlide].description}
            </p>
            
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-grindtime-blue' : 'bg-muted'}`} 
                />
              ))}
            </div>
            
            <Button 
              className="w-full" 
              onClick={nextSlide}
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <span className="font-bold text-2xl text-grindtime-blue">Grind<span className="text-grindtime-purple">Time</span></span>
              <p className="text-muted-foreground mt-2">Sign up to start your productivity journey</p>
            </div>
            
            <div className="w-full relative">
              {/* Small login button */}
              <div className="absolute right-0 top-0 mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("login")}
                  className={activeTab === "login" ? "border-b-2 border-primary rounded-none px-2" : "px-2"}
                >
                  Already have an account? <LogIn className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <Card className="w-full mt-8">
                {activeTab === "login" ? (
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
                      <p className="text-sm text-muted-foreground">Sign in to continue your productivity journey</p>
                    </div>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                          </Button>
                        </div>
                        
                        <div className="text-center mt-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab("signup")}
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            Need an account? Sign up
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                ) : (
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Create Your Account</h2>
                      <p className="text-sm text-muted-foreground">Start your productivity journey today</p>
                    </div>
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                            <UserPlus className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
