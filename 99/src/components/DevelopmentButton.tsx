import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigation } from "../hooks/useNavigation";

export function DevelopmentButton() {
  const navigation = useNavigation();
  
  // No ambiente Figma Make, sempre mostrar o botão de dev
  const isDevelopment = true;
  
  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => navigation.navigateTo("/dev")}
        variant="outline"
        size="sm"
        className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-lg"
      >
        <Settings className="h-4 w-4 mr-1" />
        Dev Tools
      </Button>
    </div>
  );
}

export default DevelopmentButton;