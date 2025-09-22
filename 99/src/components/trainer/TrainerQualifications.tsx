import { Award, Trophy, Users, Calendar } from 'lucide-react';

interface Qualification {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

interface TrainerQualificationsProps {
  qualifications?: Qualification[];
}

export function TrainerQualifications({ qualifications }: TrainerQualificationsProps) {
  const defaultQualifications: Qualification[] = [
    { icon: Award, title: "CREF", subtitle: "Conselho Regional de Educação Física" },
    { icon: Trophy, title: "Treinamento Funcional", subtitle: "Certificação avançada" },
    { icon: Users, title: "Nutrição Esportiva", subtitle: "Especialização completa" },
    { icon: Calendar, title: "Musculação Avançada", subtitle: "Curso profissional" }
  ];

  const quals = qualifications || defaultQualifications;

  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-xl font-semibold mb-6">Qualificações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quals.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:bg-accent hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-2 bg-[#FF385C]/10 rounded-lg group-hover:bg-[#FF385C]/20 transition-colors">
              <item.icon className="h-6 w-6 text-[#FF385C]" />
            </div>
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}