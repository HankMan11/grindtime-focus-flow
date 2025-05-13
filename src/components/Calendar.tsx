
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Please select a date",
  }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
});

const CalendarComponent = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      start_time: "09:00",
      end_time: "10:00",
    },
  });

  // Fetch events from Supabase
  const { data: events = [], refetch } = useQuery({
    queryKey: ["calendar-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Error fetching calendar events:", error);
        toast({
          title: "Error fetching events",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });
  
  // Find events for the selected date
  const eventsForSelectedDate = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === date.toDateString();
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      // Combine date with time strings
      const startDateTime = new Date(values.date);
      const [startHours, startMinutes] = values.start_time.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);
      
      const endDateTime = new Date(values.date);
      const [endHours, endMinutes] = values.end_time.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);
      
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: values.title,
        description: values.description || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      
      if (error) throw error;
      
      toast({
        title: "Event created",
        description: "Your event has been added to the calendar",
      });
      
      form.reset();
      setIsEventDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Calendar</CardTitle>
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Study session" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add details about this event" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        className="rounded-md border pointer-events-auto"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">Save Event</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate || new Date())}
              className="rounded-md border pointer-events-auto"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-2">
              Events for {format(date, "MMMM d, yyyy")}
            </h3>
            <div className="space-y-2">
              {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event) => (
                  <div key={event.id} className="border rounded-md p-3">
                    <h4 className="font-medium">{event.title}</h4>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                    <div className="text-sm mt-1 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No events scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarComponent;
