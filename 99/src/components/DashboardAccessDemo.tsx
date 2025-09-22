import DashboardAccessButtons from './DashboardAccessButtons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

export default function DashboardAccessDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Título da demo */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl">Dashboard Access Demo</h1>
        <p className="text-muted-foreground">
          Teste os botões de acesso aos diferentes dashboards da plataforma
        </p>
      </div>

      {/* Versão padrão */}
      <Card>
        <CardHeader>
          <CardTitle>Versão Padrão (Cards)</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardAccessButtons />
        </CardContent>
      </Card>

      <Separator />

      {/* Versão compacta */}
      <Card>
        <CardHeader>
          <CardTitle>Versão Compacta (Botões)</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardAccessButtons variant="compact" />
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2">Importação:</h4>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              import DashboardAccessButtons from './components/DashboardAccessButtons';
            </code>
          </div>
          
          <div>
            <h4 className="mb-2">Uso básico:</h4>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              <DashboardAccessButtons />
            </code>
          </div>
          
          <div>
            <h4 className="mb-2">Versão compacta:</h4>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              <DashboardAccessButtons variant="compact" />
            </code>
          </div>

          <div>
            <h4 className="mb-2">Com classes customizadas:</h4>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              <DashboardAccessButtons className="my-8" />
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}