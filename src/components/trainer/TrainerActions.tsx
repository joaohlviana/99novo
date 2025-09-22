import { Button } from "../ui/button";
import { Heart, Instagram, Share2, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";

export function TrainerActions() {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(21);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'João Silva - Personal Trainer',
        text: 'Confira o perfil deste incrível personal trainer!',
        url: window.location.href,
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Instagram Button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 hover:bg-accent"
        onClick={() =>
          window.open(
            "https://instagram.com/joao_coach",
            "_blank",
          )
        }
      >
        <Instagram className="h-4 w-4" />
        <span className="hidden sm:inline">@joao_coach</span>
      </Button>

      {/* Like Button */}
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 transition-colors border-border ${
          isLiked 
            ? 'text-[#e0093e] hover:text-[#c0082e]' 
            : 'hover:text-[#e0093e]'
        }`}
        onClick={handleLike}
      >
        <Heart 
          className={`h-4 w-4 transition-colors ${
            isLiked ? 'fill-current' : ''
          }`} 
        />
        <span className="font-medium">{likeCount}</span>
      </Button>

      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        className="hover:bg-accent border-border"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {/* More Options Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-accent border-border"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>
            Reportar perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            Bloquear usuário
          </DropdownMenuItem>
          <DropdownMenuItem>
            Copiar link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}