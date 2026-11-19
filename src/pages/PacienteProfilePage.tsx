import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, User } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PacienteProfilePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const successMessage = (
    location.state as { successMessage?: string } | null
  )?.successMessage;

  return (
    <AppLayout>
      {successMessage && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-emerald-900 hover:bg-emerald-50"
        >
          <Link to="/dashboard">
            <ArrowLeft className="size-4" />
            <span>Voltar para o Dashboard</span>
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
          Perfil do Paciente
        </h1>
      </div>

      <Card className="border-emerald-100 bg-white">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <User className="size-5" />
          </div>
          <CardTitle className="text-lg text-emerald-950">
            Ficha clínica
          </CardTitle>
          <CardDescription>
            ID do paciente: <span className="font-mono text-xs">{id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O perfil completo do paciente será implementado nas próximas etapas.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

