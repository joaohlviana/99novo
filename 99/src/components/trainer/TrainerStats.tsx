import { Users, Star, Award } from 'lucide-react';

interface TrainerStatsProps {
  stats: {
    students: number;
    rating: number;
    experience: number;
  };
}

export function TrainerStats({ stats }: TrainerStatsProps) {
  const statsData = [
    {
      icon: Users,
      value: stats.students,
      label: "Alunos",
      color: "text-blue-500"
    },
    {
      icon: Star,
      value: stats.rating.toFixed(2),
      label: "Avaliação",
      color: "text-yellow-500"
    },
    {
      icon: Award,
      value: stats.experience,
      label: "Anos experiência",
      color: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
      {statsData.map((stat, index) => (
        <div key={index} className="text-center group">
          <div className="flex items-center justify-center mb-2">
            <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform duration-200`} />
          </div>
          <div className="text-xl font-semibold">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}