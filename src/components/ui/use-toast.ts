
import { useToast, toast } from "@/hooks/use-toast";

// Override toast behavior for mobile when needed
const showMobileToast = (message: string, options = {}) => {
  if (typeof window !== 'undefined') {
    toast(message, options);
  }
};

export { useToast, toast, showMobileToast };
