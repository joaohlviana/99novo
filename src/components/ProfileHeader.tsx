import React from "react";
import { cn } from "../lib/utils";

// Ícones
const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DumbbellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 012 2v8a2 2 0 01-2 2v-2m0-8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V8z" />
  </svg>
);

const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
);

// UI Components
const Avatar = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("relative inline-block ring-4 ring-white shadow-lg", className)}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt = "Avatar", className }: { src: string; alt?: string; className?: string }) => (
  <img src={src} alt={alt} className={cn("w-full h-full object-cover rounded-full", className)} loading="lazy" />
);

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const baseClasses = "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200";
  const variantClasses = "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800";
  return <span className={cn(baseClasses, variantClasses, className)}>{children}</span>;
};

const Button = ({
  children,
  variant = "default",
  className,
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 py-2 px-4 text-sm";
  const variantClasses = {
    default: "bg-[#FF385C] text-white hover:bg-[#E31C5F] shadow-md",
    outline: "border border-border bg-background hover:bg-accent text-foreground",
  };
  return (
    <button
      className={cn(baseClasses, variantClasses[variant] || variantClasses.default, className)}
      {...props}
    >
      {children}
    </button>
  );
};

const AvatarStack = ({ avatars }: { avatars: string[] }) => (
  <div className="flex items-center">
    <div className="flex -space-x-2">
      {avatars.slice(0, 4).map((src, index) => (
        <img
          key={index}
          className="w-8 h-8 rounded-full ring-2 ring-white hover:scale-110 hover:z-10 transition-transform duration-200"
          src={src}
          alt={`Avatar ${index + 1}`}
          loading="lazy"
        />
      ))}
    </div>
    {avatars.length > 4 && (
      <span className="ml-2 text-sm text-muted-foreground">
        +{avatars.length - 4}
      </span>
    )}
  </div>
);

interface ProfileHeaderProps {
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  profileImage: string;
  specialties: Array<{
    name: string;
    icon: React.ReactNode;
  }>;
  stats: {
    activeStudents: number;
    following: number;
    followers: string;
  };
  avatarStack: string[];
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  rating,
  reviewCount,
  location,
  profileImage,
  specialties,
  stats,
  avatarStack
}) => {
  return (
    <div className="bg-card rounded-lg shadow-lg p-6 mb-6 border border-border">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <Avatar className="w-32 h-32 md:w-40 md:h-40">
            <AvatarImage src={profileImage} alt={name} />
          </Avatar>
        </div>
        
        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                {name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">{rating}</span>
                  <span>• {reviewCount} avaliações</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              </div>
              
              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-4">
                {specialties.slice(0, 4).map((specialty, index) => (
                  <Badge key={index} className="flex items-center space-x-1">
                    {specialty.icon}
                    <span>{specialty.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button className="flex-1 md:flex-none">
                Agendar Sessão
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none">
                Enviar Mensagem
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.activeStudents}</div>
              <div className="text-muted-foreground">Alunos Ativos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.following}</div>
              <div className="text-muted-foreground">Seguindo</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.followers}</div>
              <div className="text-muted-foreground">Seguidores</div>
            </div>
            <div className="flex items-center">
              <AvatarStack avatars={avatarStack} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};