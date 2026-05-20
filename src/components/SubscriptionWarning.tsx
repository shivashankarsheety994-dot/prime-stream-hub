import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface SubscriptionWarningProps {
  isOpen: boolean;
  onClose: () => void;
  type: "expiring" | "expired" | null;
}

export function SubscriptionWarning({ isOpen, onClose, type }: SubscriptionWarningProps) {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate("/plans");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "expired" ? "Subscription Expired" : "Subscription Expiring Soon"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {type === "expired"
              ? "Your subscription has expired. Please subscribe for ₹40 per month to continue enjoying our service."
              : "Your subscription is about to expire. Please renew to continue enjoying our service."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {type === "expired" ? (
            <AlertDialogAction onClick={handleSubscribe}>Subscribe</AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={onClose}>Ok</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
