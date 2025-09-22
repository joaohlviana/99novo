interface TrainerAboutProps {
  name: string;
  description: string[];
}

export function TrainerAbout({ name, description }: TrainerAboutProps) {
  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-xl font-semibold mb-4">Sobre {name}</h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        {description.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}