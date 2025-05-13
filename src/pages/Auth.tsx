
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, UserPlus, ArrowRight, Rocket, Clock, LineChart, Camera, User as UserIcon, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/contexts/AuthContext";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";

// Form schema for login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Form schema for signup
const signupSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Form schema for OTP verification
const otpSchema = z.object({
  otp: z.string().length(6, "Verification code must be 6 characters")
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingSignupData, setPendingSignupData] = useState<{username: string, email: string, password: string, avatar: string | null} | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
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
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      // Store the signup data for after OTP verification
      setPendingSignupData({
        username: values.username,
        email: values.email,
        password: values.password,
        avatar: avatarUrl
      });
      
      // Request OTP code
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setPendingEmail(values.email);
      setVerifyingEmail(true);
      toast.success("Verification code sent! Please check your email.");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (values: z.infer<typeof otpSchema>) => {
    if (!pendingSignupData) {
      toast.error("Missing signup data. Please try again.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify the OTP code and sign in
      const { error, data } = await supabase.auth.verifyOtp({
        email: pendingSignupData.email,
        token: values.otp,
        type: 'email',
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Save user profile details in localStorage
        const userProfile: UserProfile = {
          username: pendingSignupData.username,
          avatar_url: pendingSignupData.avatar || "",
        };
        localStorage.setItem(`profile-${data.user.id}`, JSON.stringify(userProfile));

        toast.success("Account created successfully!");
        
        // Set up password for the user
        const { error: passwordError } = await supabase.auth.updateUser({ 
          password: pendingSignupData.password 
        });
        
        if (passwordError) {
          console.error("Error setting password:", passwordError);
          // Continue anyway since the account is created
        }
        
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!pendingEmail) {
      toast.error("No email to send verification code to");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: pendingEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Verification code resent. Please check your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification code");
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

  const backToSignup = () => {
    setVerifyingEmail(false);
    setPendingSignupData(null);
  };

  // Render OTP verification screen
  const renderOtpVerification = () => (
    <Card className="w-full mt-8">
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to {pendingEmail}
          </p>
        </div>
        
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-center mt-2">
                <Button 
                  variant="ghost" 
                  type="button"
                  size="sm" 
                  onClick={resendVerificationCode}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Didn't receive a code? Resend
                </Button>
              </div>
              
              <div className="text-center mt-1">
                <Button 
                  variant="ghost" 
                  type="button"
                  size="sm" 
                  onClick={backToSignup}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Go back to signup
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

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
              
              {verifyingEmail ? (
                renderOtpVerification()
              ) : (
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
                      
                      <div className="flex flex-col items-center mb-6">
                        <input 
                          type="file"
                          accept="image/*"
                          ref={avatarInputRef}
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <div 
                          className="cursor-pointer relative"
                          onClick={handleAvatarClick}
                        >
                          <Avatar className="h-20 w-20 border-2 border-grindtime-green">
                            {avatarUrl ? (
                              <AvatarImage src={avatarUrl} alt="Profile" />
                            ) : (
                              <AvatarFallback className="bg-grindtime-purple/20 flex items-center justify-center">
                                <UserIcon className="h-8 w-8 text-grindtime-purple" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="absolute bottom-0 right-0 bg-grindtime-blue rounded-full p-1">
                            <Camera className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Add a profile picture</p>
                      </div>
                      
                      <Form {...signupForm}>
                        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                          <FormField
                            control={signupForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
