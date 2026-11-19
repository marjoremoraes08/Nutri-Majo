import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  Target,
  Users,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { listPacientes, type PacienteListItem } from '@/services/pacientes';

function formatDatePtBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function formatObjetivo(paciente: PacienteListItem): string {
  const parts: string[] = [];
  if (paciente.objetivos && paciente.objetivos.length > 0) {
    parts.push(...paciente.objetivos);
  }
  if (paciente.objetivo_texto?.trim()) {
    parts.push(paciente.objetivo_texto.trim());
  }
  return parts.length > 0 ? parts.join(', ') : 'Objetivo não informado';
}

export default function PacientesPage() {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPacientes = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listPacientes(user.id);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      setError('Não foi possível carregar a lista de pacientes.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadPacientes();
  }, [loadPacientes]);

  const filteredPacientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pacientes;
    return pacientes.filter((p) => p.nome.toLowerCase().includes(term));
  }, [pacientes, search]);

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            Pacientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os pacientes cadastrados no seu consultório.
          </p>
        </div>

        <Button
          asChild
          className="w-fit bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Link to="/pacientes/novo">
            <Plus className="size-4" />
            <span>Novo Paciente</span>
          </Link>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente por nome..."
          className="border-emerald-200 bg-white pl-10 focus-visible:ring-emerald-500"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPacientes()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="border-emerald-100 bg-white">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-2">
                  <div className="h-5 w-48 animate-pulse rounded bg-emerald-100" />
                  <div className="h-4 w-72 animate-pulse rounded bg-emerald-50" />
                </div>
                <div className="size-5 animate-pulse rounded bg-emerald-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pacientes.length === 0 ? (
        <Card className="border-emerald-100 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Users className="size-6" />
            </div>
            <p className="text-base font-medium text-emerald-950">
              Nenhum paciente cadastrado ainda
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em &quot;Novo Paciente&quot; para realizar o primeiro cadastro.
            </p>
          </CardContent>
        </Card>
      ) : filteredPacientes.length === 0 ? (
        <Card className="border-emerald-100 bg-white">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum paciente encontrado para &quot;{search}&quot;.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPacientes.map((paciente) => (
            <Link
              key={paciente.id}
              to={`/pacientes/${paciente.id}`}
              className="group block"
            >
              <Card className="border-emerald-100 bg-white transition-all hover:border-emerald-300 hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 space-y-1.5">
                    <h2 className="truncate text-base font-semibold text-emerald-950 group-hover:text-emerald-700">
                      {paciente.nome}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="size-3.5 text-emerald-600" />
                        <span className="truncate">{formatObjetivo(paciente)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-emerald-600" />
                        <span>
                          Última consulta:{' '}
                          {paciente.ultimaConsulta
                            ? formatDatePtBr(paciente.ultimaConsulta)
                            : 'Nenhuma consulta'}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
