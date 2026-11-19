import { neon } from '@/lib/neon';

export interface PacienteListItem {
  id: string;
  nome: string;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  ultimaConsulta: string | null;
}

export interface CreatePacienteInput {
  nutricionista_id: string;
  nome: string;
  data_nascimento?: string | null;
  sexo?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  peso_inicial?: number | null;
  altura?: number | null;
  objetivos?: string[] | null;
  objetivo_texto?: string | null;
  nivel_atividade?: string | null;
  patologias?: string[] | null;
  restricoes_alimentares?: string[] | null;
  alergias?: string[] | null;
  medicamentos?: string | null;
  suplementos?: string | null;
  refeicoes_por_dia?: number | null;
  horario_acorda?: string | null;
  horario_dorme?: string | null;
  litros_agua?: number | null;
  atividade_fisica?: boolean | null;
  atividade_fisica_descricao?: string | null;
  observacoes?: string | null;
}

export async function listPacientes(
  nutricionistaId: string
): Promise<PacienteListItem[]> {
  const { data: pacientes, error: pacientesError } = await neon
    .from('pacientes')
    .select('id, nome, objetivos, objetivo_texto')
    .eq('nutricionista_id', nutricionistaId)
    .order('nome', { ascending: true });

  if (pacientesError) {
    throw pacientesError;
  }

  const pacienteList = (pacientes ?? []) as Array<{
    id: string;
    nome: string;
    objetivos: string[] | null;
    objetivo_texto: string | null;
  }>;

  if (pacienteList.length === 0) {
    return [];
  }

  const pacienteIds = pacienteList.map((p) => p.id);

  const { data: consultas, error: consultasError } = await neon
    .from('consultas')
    .select('paciente_id, data_consulta')
    .in('paciente_id', pacienteIds)
    .order('data_consulta', { ascending: false });

  if (consultasError) {
    throw consultasError;
  }

  const latestByPaciente = new Map<string, string>();
  for (const c of (consultas ?? []) as Array<{
    paciente_id: string;
    data_consulta: string;
  }>) {
    const current = latestByPaciente.get(c.paciente_id);
    if (!current || c.data_consulta > current) {
      latestByPaciente.set(c.paciente_id, c.data_consulta);
    }
  }

  return pacienteList.map((p) => ({
    ...p,
    ultimaConsulta: latestByPaciente.get(p.id) ?? null,
  }));
}

export async function createPaciente(
  input: CreatePacienteInput
): Promise<{ id: string; nome: string }> {
  const { data, error } = await neon
    .from('pacientes')
    .insert(input)
    .select('id, nome')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; nome: string };
}

