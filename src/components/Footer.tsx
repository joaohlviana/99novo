import React from "react";
import { sportsCategories } from "../data/constants";
import { useNavigation } from "../hooks/useNavigation";

const getFooterSections = (navigation: any) => [
  {
    title: "Navegação",
    links: [
      { label: "Início", action: navigation.navigateToHome },
      { label: "Catálogo de Treinadores", action: navigation.navigateToCatalog },
      { label: "Seja um Treinador", action: navigation.navigateToBecomeTrainer },
      { label: "Seja um Cliente", action: navigation.navigateToBecomeClient },
    ],
  },
  {
    title: "Dashboards",
    links: [
      { label: "Dashboard Cliente", action: navigation.navigateToClientDashboard },
      { label: "Dashboard Treinador", action: navigation.navigateToTrainerDashboard },
      { label: "Dashboard Admin", action: navigation.navigateToAdminDashboard },
    ],
  },
  {
    title: "Modalidades Populares",
    links: sportsCategories.slice(0, 8).map(sport => ({
      label: sport.label,
      action: () => navigation.navigateToSport(sport.id)
    })),
  },
  {
    title: "Sobre",
    links: [
      { label: "Quem somos", action: () => navigation.navigateToHome() },
      { label: "Termos de uso", action: () => navigation.navigateToHome() },
      { label: "Política de privacidade", action: () => navigation.navigateToHome() },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "contato@99coach.com.br", href: "mailto:contato@99coach.com.br" },
      { label: "+55 43 9999-9999", href: "tel:+5543999999999" },
      { label: "Fale conosco", href: "mailto:contato@99coach.com.br" },
    ],
  },
];

const Logo = () => (
  <svg width="88" height="97" viewBox="0 0 88 97" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 33.3859V64.4149C0 70.478 3.2461 76.0806 8.51613 79.1122L35.4839 94.6267C40.7539 97.6583 47.2461 97.6583 52.5161 94.6267L79.4839 79.1122C84.7539 76.0806 88 70.478 88 64.4149V33.3859C88 27.3227 84.7539 21.7201 79.4839 18.6886L52.5161 3.17409C47.2461 0.142492 40.7539 0.142492 35.4839 3.17409L8.51613 18.6886C3.2461 21.7201 0 27.3227 0 33.3859Z" fill="#DF0A3D"/>
    <path d="M54.1641 55.8867C48.3454 54.5531 43.9932 49.3342 43.9932 43.1174C43.9932 35.8936 49.8704 30.0177 57.0929 30.0177C64.3155 30.0177 70.1927 35.8949 70.1927 43.1174C70.1927 45.1329 69.4523 47.7703 67.8624 51.4173C66.7174 54.043 65.1326 57.1683 63.1497 60.7048C59.8071 66.6691 56.5204 71.7084 56.3825 71.9205L49.6284 71.9296C49.6609 71.8789 54.7119 63.5503 57.9556 57.759C59.837 54.3995 61.3307 51.4577 62.3937 49.0181C64.0435 45.2318 64.2218 43.6301 64.2218 43.1174C64.2218 39.1867 61.0236 35.9886 57.0929 35.9886C53.1622 35.9886 49.964 39.1867 49.964 43.1174C49.964 47.0481 53.1622 50.2463 57.0929 50.2463" fill="white"/>
    <path d="M25.6709 55.8867C19.8523 54.5531 15.5 49.3342 15.5 43.1174C15.5 35.8936 21.3772 30.0177 28.5997 30.0177C35.8223 30.0177 41.6995 35.8949 41.6995 43.1174C41.6995 45.1329 40.9592 47.7703 39.3692 51.4173C38.2242 54.043 36.6394 57.1683 34.6565 60.7048C31.3139 66.6691 28.0273 71.7084 27.8893 71.9205L21.1352 71.9296C21.1677 71.8789 26.2187 63.5503 29.4624 57.759C31.3438 54.3995 32.8375 51.4577 33.9005 49.0181C35.5504 45.2318 35.7286 43.6301 35.7286 43.1174C35.7286 39.1867 32.5305 35.9886 28.5997 35.9886C24.669 35.9886 21.4709 39.1867 21.4709 43.1174C21.4709 47.0481 24.669 50.2463 28.5997 50.2463" fill="white"/>
    <path d="M69.6338 32.957C72.1071 32.957 74.1122 30.9519 74.1122 28.4785C74.1122 26.0051 72.1071 24 69.6338 24C67.1604 24 65.1553 26.0051 65.1553 28.4785C65.1553 30.9519 67.1604 32.957 69.6338 32.957Z" fill="white"/>
    <path d="M40.9951 32.957C43.4685 32.957 45.4736 30.9519 45.4736 28.4785C45.4736 26.0051 43.4685 24 40.9951 24C38.5217 24 36.5166 26.0051 36.5166 28.4785C36.5166 30.9519 38.5217 32.957 40.9951 32.957Z" fill="white"/>
  </svg>
);

export const Footer = (): JSX.Element => {
  const navigation = useNavigation();
  const footerSections = getFooterSections(navigation);

  return (
    <footer className="flex flex-col items-center gap-10 pt-16 pb-8 px-6 bg-background border-t border-border">
      <div className="w-full max-w-[87.5rem] mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 px-8 py-0">
          {/* Logo Section */}
          <div className="flex flex-col items-start gap-6 lg:w-80">
            <div className="inline-flex items-start pt-4 pb-0 px-0">
              <Logo />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Conectando treinadores qualificados com pessoas que buscam alcançar seus objetivos de forma personalizada e eficiente.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 flex-1 pt-4">
            {footerSections.map((section, index) => (
              <div
                key={`footer-section-${index}`}
                className="flex flex-col items-start gap-4"
              >
                {/* Section Title */}
                <div className="font-medium text-foreground text-sm uppercase tracking-wide">
                  {section.title}
                </div>

                {/* Section Links */}
                <div className="flex flex-col items-start gap-3 w-full">
                  {section.links.map((link, linkIndex) => {
                    // Dashboard links - tratamento especial
                    if (section.title === "Dashboards") {
                      return (
                        <button
                          key={`link-${index}-${linkIndex}`}
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Dashboard link clicked:', link.label);
                            if (link.action && typeof link.action === 'function') {
                              try {
                                link.action();
                              } catch (error) {
                                console.error('Error executing dashboard navigation:', error);
                              }
                            }
                          }}
                          className="text-muted-foreground hover:text-brand transition-colors text-sm text-left cursor-pointer hover:underline"
                        >
                          {link.label}
                        </button>
                      );
                    }
                    
                    // Links com ação (navegação programática)
                    if (link.action && typeof link.action === 'function') {
                      return (
                        <button
                          key={`link-${index}-${linkIndex}`}
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Navigation link clicked:', link.label);
                            try {
                              link.action();
                            } catch (error) {
                              console.error('Error executing navigation:', error);
                            }
                          }}
                          className="text-muted-foreground hover:text-brand transition-colors text-sm text-left cursor-pointer hover:underline"
                        >
                          {link.label}
                        </button>
                      );
                    }
                    
                    // Links tradicionais (href)
                    if (link.href) {
                      return (
                        <a
                          key={`link-${index}-${linkIndex}`}
                          href={link.href}
                          className={`text-muted-foreground hover:text-brand transition-colors text-sm ${
                            section.title === "Contato" ? "hover:underline" : ""
                          }`}
                        >
                          {link.label}
                        </a>
                      );
                    }
                    
                    // Fallback - se não tem nem action nem href, não renderiza nada
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa do Site Completo */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-medium text-foreground mb-6 text-center lg:text-left">
            Mapa do Site - Todas as Modalidades
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {sportsCategories.map((sport) => (
              <button
                key={sport.id}
                onClick={() => navigation.navigateToSport(sport.id)}
                className="text-muted-foreground hover:text-brand transition-colors text-sm py-1 text-left"
              >
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        {/* Componentes e Páginas para Desenvolvimento */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <details className="group">
            <summary className="font-medium text-foreground text-sm cursor-pointer hover:text-brand transition-colors">
              Páginas e Componentes do Sistema (Desenvolvimento)
            </summary>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs text-muted-foreground">
              <div>
                <div className="font-medium mb-2">Páginas Principais</div>
                <div className="space-y-1">
                  <button onClick={navigation.navigateToHome} className="text-left hover:text-brand transition-colors cursor-pointer">HomePage</button>
                  <button onClick={navigation.navigateToCatalog} className="text-left hover:text-brand transition-colors cursor-pointer">CatalogPage</button>
                  <button onClick={() => navigation.navigateToTrainer('demo')} className="text-left hover:text-brand transition-colors cursor-pointer">TrainerProfilePage</button>
                  <button onClick={() => navigation.navigateToProgram('demo')} className="text-left hover:text-brand transition-colors cursor-pointer">ProgramDetailsPage</button>
                  <button onClick={() => navigation.navigateToSport('futebol')} className="text-left hover:text-brand transition-colors cursor-pointer">SportPage</button>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Cadastros</div>
                <div className="space-y-1">
                  <button onClick={navigation.navigateToBecomeTrainer} className="text-left hover:text-brand transition-colors cursor-pointer">BecomeTrainerPage</button>
                  <button onClick={navigation.navigateToBecomeClient} className="text-left hover:text-brand transition-colors cursor-pointer">BecomeClientPage</button>
                  <button onClick={() => navigation.navigateTo('/demo/dashboard-access')} className="text-left hover:text-brand transition-colors cursor-pointer">LoginModal</button>
                  <div className="text-muted-foreground/60">ProtectedRoute</div>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Dashboards</div>
                <div className="space-y-1">
                  <button onClick={navigation.navigateToTrainerDashboard} className="text-left hover:text-brand transition-colors cursor-pointer">TrainerDashboard</button>
                  <button onClick={navigation.navigateToClientDashboard} className="text-left hover:text-brand transition-colors cursor-pointer">ClientDashboard</button>
                  <button onClick={navigation.navigateToAdminDashboard} className="text-left hover:text-brand transition-colors cursor-pointer">AdminDashboard</button>
                  <button onClick={() => navigation.navigateTo('/demo/dashboard-access')} className="text-left hover:text-brand transition-colors cursor-pointer">DashboardRoutes</button>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Componentes UI</div>
                <div className="space-y-1">
                  <button onClick={navigation.navigateToCatalog} className="text-left hover:text-brand transition-colors cursor-pointer">TrainerCard</button>
                  <button onClick={() => navigation.navigateToTrainer('demo')} className="text-left hover:text-brand transition-colors cursor-pointer">ProgramCard</button>
                  <button onClick={() => navigation.navigateToSport('futebol')} className="text-left hover:text-brand transition-colors cursor-pointer">SportFilters</button>
                  <button onClick={() => navigation.navigateToTrainer('demo')} className="text-left hover:text-brand transition-colors cursor-pointer">StarRating</button>
                  <button onClick={() => navigation.navigateTo('/demo/dashboard-access')} className="text-left hover:text-brand transition-colors cursor-pointer">UserModeSwitch</button>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Testes do Sistema</div>
                <div className="space-y-1">
                  <button onClick={() => navigation.navigateTo('/test/specialties-gin-basic')} className="text-left hover:text-brand transition-colors cursor-pointer">Teste Especialidades GIN</button>
                  <button onClick={() => navigation.navigateTo('/system/health')} className="text-left hover:text-brand transition-colors cursor-pointer">Health Check</button>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="w-full max-w-[87.5rem] px-8 mx-auto">
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 99coach. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};