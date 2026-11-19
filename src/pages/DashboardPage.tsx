import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CalendarCheck,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import {
  getDashboardData,
  type DashboardData,
} from '@/services/dashboard';

function formatDatePtBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export default function DashboardPage() {
  const { user, nutricionista } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = nutricionista?.nome || user?.name || 'Nutricionista';

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getDashboardData(user.id);
      setData(result);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Não foi possível carregar os dados do dashboard. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            Olá, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe os indicadores principais do seu consultório em tempo real.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="w-fit border-emerald-200 text-emerald-900 hover:bg-emerald-50"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          <span>Atualizar</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadDashboard()}
              className="shrink-0"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && !data ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="border-emerald-100 bg-white">
              <CardHeader className="pb-2">
                <div className="mb-2 size-10 animate-pulse rounded-xl bg-emerald-100" />
                <div className="h-5 w-40 animate-pulse rounded bg-emerald-100" />
                <div className="mt-1 h-4 w-56 animate-pulse rounded bg-emerald-50" />
              </CardHeader>
              <CardContent>
                <div className="h-9 w-20 animate-pulse rounded bg-emerald-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 — Total de pacientes ativos */}
          <Card className="border-emerald-100 bg-white shadow-xs transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Users className="size-5" />
              </div>
              <CardTitle className="text-lg text-emerald-950">
                Total de pacientes ativos
              </CardTitle>
              <CardDescription>
                Pacientes cadastrados por você no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-emerald-950">
                {data?.totalPacientes ?? 0}
              </p>
            </CardContent>
          </Card>

          {/* Card 2 — Consultas da semana */}
          <Card className="border-emerald-100 bg-white shadow-xs transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CalendarCheck className="size-5" />
              </div>
              <CardTitle className="text-lg text-emerald-950">
                Consultas da semana
              </CardTitle>
              <CardDescription>
                Atendimentos registrados na semana atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-emerald-950">
                {data?.consultasSemana ?? 0}
              </p>
            </CardContent>
          </Card>

          {/* Card 3 — Pacientes sem retorno */}
          <Card className="border-emerald-100 bg-white shadow-xs transition-shadow hover:shadow-md md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock className="size-5" />
              </div>
              <CardTitle className="text-lg text-emerald-950">
                Pacientes sem retorno
              </CardTitle>
              <CardDescription>
                Última consulta há mais de 30 dias e sem retorno agendado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data && data.pacientesSemRetorno.length > 0 ? (
                <ul className="divide-y divide-emerald-100">
                  {data.pacientesSemRetorno.map((paciente) => (
                    <li key={paciente.id}>
                      <Link
                        to={`/pacientes/${paciente.id}`}
                        className="group flex items-center justify-between py-2.5 text-sm transition-colors hover:text-emerald-700"
                      >
                        <div>
                          <p className="font-medium text-emerald-950 group-hover:text-emerald-700">
                            {paciente.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Última consulta: {formatDatePtBr(paciente.ultimaConsulta)}
                          </p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-900">
                  Nenhum paciente sem retorno no momento
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
