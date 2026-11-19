import { neon } from '@/lib/neon';

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  ultimaConsulta: string;
}

export interface DashboardData {
  totalPacientes: number;
  consultasSemana: number;
  pacientesSemRetorno: PacienteSemRetorno[];
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentWeekRange(now: Date): { start: string; end: string } {
  const dayOfWeek = now.getDay(); // 0 (Dom) .. 6 (Sáb)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: toIsoDate(start),
    end: toIsoDate(end),
  };
}

export async function getDashboardData(
  nutricionistaId: string
): Promise<DashboardData> {
  const { data: pacientes, error: pacientesError } = await neon
    .from('pacientes')
    .select('id, nome')
    .eq('nutricionista_id', nutricionistaId);

  if (pacientesError) {
    throw pacientesError;
  }

  const pacienteList = (pacientes ?? []) as Array<{ id: string; nome: string }>;
  const totalPacientes = pacienteList.length;

  if (totalPacientes === 0) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }

  const pacienteIds = pacienteList.map((p) => p.id);

  const { data: consultas, error: consultasError } = await neon
    .from('consultas')
    .select('paciente_id, data_consulta, proximo_retorno')
    .in('paciente_id', pacienteIds)
    .order('data_consulta', { ascending: false });

  if (consultasError) {
    throw consultasError;
  }

  const consultaList = (consultas ?? []) as Array<{
    paciente_id: string;
    data_consulta: string;
    proximo_retorno: string | null;
  }>;

  const now = new Date();
  const todayStr = toIsoDate(now);
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange(now);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const thirtyDaysAgoStr = toIsoDate(thirtyDaysAgo);

  let consultasSemana = 0;
  const latestConsultaByPaciente = new Map<
    string,
    { data_consulta: string; proximo_retorno: string | null }
  >();

  for (const consulta of consultaList) {
    if (
      consulta.data_consulta >= weekStart &&
      consulta.data_consulta <= weekEnd
    ) {
      consultasSemana += 1;
    }

    const existing = latestConsultaByPaciente.get(consulta.paciente_id);
    if (!existing || consulta.data_consulta > existing.data_consulta) {
      latestConsultaByPaciente.set(consulta.paciente_id, {
        data_consulta: consulta.data_consulta,
        proximo_retorno: consulta.proximo_retorno,
      });
    }
  }

  const pacientesSemRetorno: PacienteSemRetorno[] = [];

  for (const paciente of pacienteList) {
    const latest = latestConsultaByPaciente.get(paciente.id);
    if (!latest) continue;

    const isOver30Days = latest.data_consulta < thirtyDaysAgoStr;
    const hasScheduledReturn =
      Boolean(latest.proximo_retorno) &&
      (latest.proximo_retorno as string) >= todayStr;

    if (isOver30Days && !hasScheduledReturn) {
      pacientesSemRetorno.push({
        id: paciente.id,
        nome: paciente.nome,
        ultimaConsulta: latest.data_consulta,
      });
    }
  }

  pacientesSemRetorno.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return {
    totalPacientes,
    consultasSemana,
    pacientesSemRetorno,
  };
}

