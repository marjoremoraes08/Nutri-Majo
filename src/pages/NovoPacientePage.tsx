import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  X,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { createPaciente } from '@/services/pacientes';

type TabKey = 'pessoal' | 'clinico' | 'habitos';

const SEXO_OPTIONS = ['Feminino', 'Masculino', 'Outro'];

const OBJETIVO_OPTIONS = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
];

const NIVEL_ATIVIDADE_OPTIONS = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
];

const PATOLOGIAS_OPTIONS = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
];

const RESTRICOES_OPTIONS = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
];

const ALERGIAS_OPTIONS = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
];

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function calculateAge(isoDate: string): number | null {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function convertNumberToTime(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  let hours = 0;
  let minutes = 0;

  if (digits.length <= 2) {
    hours = Number(digits);
  } else if (digits.length === 3) {
    hours = Number(digits.slice(0, 1));
    minutes = Number(digits.slice(1, 3));
  } else {
    hours = Number(digits.slice(0, 2));
    minutes = Number(digits.slice(2, 4));
  }

  if (hours > 23) hours = 23;
  if (minutes > 59) minutes = 59;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

interface MultiSelectWithCustomProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  includeNone?: boolean;
  customPlaceholder?: string;
}

function MultiSelectWithCustom({
  label,
  options,
  selected,
  onChange,
  includeNone = false,
  customPlaceholder = 'Adicionar outro...',
}: MultiSelectWithCustomProps) {
  const [customText, setCustomText] = useState('');

  const toggleItem = (item: string) => {
    if (item === 'Nenhum') {
      onChange(selected.includes('Nenhum') ? [] : ['Nenhum']);
      return;
    }

    const withoutNone = selected.filter((v) => v !== 'Nenhum');
    if (withoutNone.includes(item)) {
      onChange(withoutNone.filter((v) => v !== item));
    } else {
      onChange([...withoutNone, item]);
    }
  };

  const addCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    const withoutNone = selected.filter((v) => v !== 'Nenhum');
    if (!withoutNone.includes(trimmed)) {
      onChange([...withoutNone, trimmed]);
    }
    setCustomText('');
  };

  const customItems = selected.filter(
    (item) => item !== 'Nenhum' && !options.includes(item)
  );

  return (
    <div className="space-y-2.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleItem(option)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50'
              )}
            >
              {isSelected && <Check className="size-3.5" />}
              <span>{option}</span>
            </button>
          );
        })}

        {includeNone && (
          <button
            type="button"
            onClick={() => toggleItem('Nenhum')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              selected.includes('Nenhum')
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50'
            )}
          >
            {selected.includes('Nenhum') && <Check className="size-3.5" />}
            <span>Nenhum</span>
          </button>
        )}

        {customItems.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => toggleItem(item)}
              aria-label={`Remover ${item}`}
              className="rounded-full hover:bg-emerald-700"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>

      {includeNone && (
        <div className="flex gap-2 pt-1">
          <Input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={customPlaceholder}
            className="max-w-xs border-emerald-200 bg-white text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustom}
            className="border-emerald-200 text-emerald-900 hover:bg-emerald-50"
          >
            <Plus className="size-4" />
            <span>Adicionar</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function NovoPacientePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('pessoal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aba 1 — Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Aba 2 — Clínico
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [patologias, setPatologias] = useState<string[]>([]);
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [alergias, setAlergias] = useState<string[]>([]);
  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Aba 3 — Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [praticaAtividade, setPraticaAtividade] = useState<boolean | null>(
    null
  );
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const idade = useMemo(() => calculateAge(dataNascimento), [dataNascimento]);

  const imc = useMemo(() => {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    if (!p || !a || p <= 0 || a <= 0) return '';
    const alturaMetros = a / 100;
    return (p / (alturaMetros * alturaMetros)).toFixed(1);
  }, [peso, altura]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setActiveTab('pessoal');
      setError('O nome completo do paciente é obrigatório.');
      return;
    }

    if (!user?.id) {
      setError('Sessão inválida. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createPaciente({
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        peso_inicial: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        objetivos: objetivos.length > 0 ? objetivos : null,
        objetivo_texto: objetivoTexto.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias.length > 0 ? patologias : null,
        restricoes_alimentares: restricoes.length > 0 ? restricoes : null,
        alergias: alergias.length > 0 ? alergias : null,
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,
        refeicoes_por_dia: refeicoesPorDia
          ? parseInt(refeicoesPorDia, 10)
          : null,
        horario_acorda: convertNumberToTime(horarioAcorda) || null,
        horario_dorme: convertNumberToTime(horarioDorme) || null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua) : null,
        atividade_fisica: praticaAtividade,
        atividade_fisica_descricao:
          praticaAtividade && atividadeDescricao.trim()
            ? atividadeDescricao.trim()
            : null,
        observacoes: observacoes.trim() || null,
      });

      navigate(`/pacientes/${created.id}`, {
        replace: true,
        state: { successMessage: 'Paciente cadastrado com sucesso!' },
      });
    } catch (err) {
      console.error('Erro ao cadastrar paciente:', err);
      setError('Não foi possível salvar o paciente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'pessoal', label: '1. Pessoal' },
    { key: 'clinico', label: '2. Clínico' },
    { key: 'habitos', label: '3. Hábitos' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-emerald-900 hover:bg-emerald-50"
        >
          <Link to="/pacientes">
            <ArrowLeft className="size-4" />
            <span>Voltar para Pacientes</span>
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
          Novo Paciente
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados do paciente. Apenas o nome completo é obrigatório.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex flex-wrap gap-2 border-b border-emerald-100 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-950/80 hover:bg-emerald-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Aba 1 — Pessoal */}
        {activeTab === 'pessoal' && (
          <Card className="border-emerald-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-950">
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Informações básicas de identificação e contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  required
                  className="border-emerald-200"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="border-emerald-200"
                    />
                    {idade !== null && (
                      <span className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        {idade} anos
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <div className="flex flex-wrap gap-2">
                    {SEXO_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSexo(sexo === option ? '' : option)}
                        className={cn(
                          'rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                          sexo === option
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="border-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@email.com"
                    className="border-emerald-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aba 2 — Clínico */}
        {activeTab === 'clinico' && (
          <Card className="border-emerald-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-950">
                Avaliação Clínica
              </CardTitle>
              <CardDescription>
                Medidas iniciais, objetivos e histórico clínico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso atual</Label>
                  <div className="relative">
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      min="0"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="70.5"
                      className="border-emerald-200 pr-10"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      kg
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura</Label>
                  <div className="relative">
                    <Input
                      id="altura"
                      type="number"
                      step="1"
                      min="0"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                      placeholder="165"
                      className="border-emerald-200 pr-10"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imc">IMC (calculado automaticamente)</Label>
                  <Input
                    id="imc"
                    type="text"
                    readOnly
                    value={imc ? `${imc} kg/m²` : '—'}
                    className="border-emerald-100 bg-emerald-50/50 font-semibold text-emerald-950"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <MultiSelectWithCustom
                  label="Objetivo"
                  options={OBJETIVO_OPTIONS}
                  selected={objetivos}
                  onChange={setObjetivos}
                />
                <Input
                  type="text"
                  value={objetivoTexto}
                  onChange={(e) => setObjetivoTexto(e.target.value)}
                  placeholder="Outro objetivo ou detalhe adicional..."
                  className="border-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Nível de atividade física</Label>
                <div className="flex flex-wrap gap-2">
                  {NIVEL_ATIVIDADE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setNivelAtividade(
                          nivelAtividade === option ? '' : option
                        )
                      }
                      className={cn(
                        'rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors',
                        nivelAtividade === option
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <MultiSelectWithCustom
                label="Patologias ou condições de saúde"
                options={PATOLOGIAS_OPTIONS}
                selected={patologias}
                onChange={setPatologias}
                includeNone
                customPlaceholder="Adicionar outra patologia..."
              />

              <MultiSelectWithCustom
                label="Restrições alimentares"
                options={RESTRICOES_OPTIONS}
                selected={restricoes}
                onChange={setRestricoes}
                includeNone
                customPlaceholder="Adicionar outra restrição..."
              />

              <MultiSelectWithCustom
                label="Alergias alimentares"
                options={ALERGIAS_OPTIONS}
                selected={alergias}
                onChange={setAlergias}
                includeNone
                customPlaceholder="Adicionar outra alergia..."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="medicamentos">Medicamentos contínuos</Label>
                  <textarea
                    id="medicamentos"
                    rows={3}
                    value={medicamentos}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    placeholder="Liste os medicamentos em uso..."
                    className="w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suplementos">Suplementos em uso</Label>
                  <textarea
                    id="suplementos"
                    rows={3}
                    value={suplementos}
                    onChange={(e) => setSuplementos(e.target.value)}
                    placeholder="Liste os suplementos em uso..."
                    className="w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aba 3 — Hábitos */}
        {activeTab === 'habitos' && (
          <Card className="border-emerald-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-950">
                Hábitos e Rotina
              </CardTitle>
              <CardDescription>
                Rotina alimentar, sono, hidratação e atividade física
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="refeicoes">Refeições por dia</Label>
                  <Input
                    id="refeicoes"
                    type="number"
                    min="0"
                    value={refeicoesPorDia}
                    onChange={(e) => setRefeicoesPorDia(e.target.value)}
                    placeholder="Ex: 5"
                    className="border-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario_acorda">Horário que acorda</Label>
                  <Input
                    id="horario_acorda"
                    type="text"
                    value={horarioAcorda}
                    onChange={(e) => setHorarioAcorda(e.target.value)}
                    onBlur={(e) =>
                      setHorarioAcorda(convertNumberToTime(e.target.value))
                    }
                    placeholder="Ex: 6 ou 630"
                    className="border-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario_dorme">Horário que dorme</Label>
                  <Input
                    id="horario_dorme"
                    type="text"
                    value={horarioDorme}
                    onChange={(e) => setHorarioDorme(e.target.value)}
                    onBlur={(e) =>
                      setHorarioDorme(convertNumberToTime(e.target.value))
                    }
                    placeholder="Ex: 23 ou 2230"
                    className="border-emerald-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="litros_agua">Água por dia</Label>
                  <div className="relative">
                    <Input
                      id="litros_agua"
                      type="number"
                      step="0.1"
                      min="0"
                      value={litrosAgua}
                      onChange={(e) => setLitrosAgua(e.target.value)}
                      placeholder="2.5"
                      className="border-emerald-200 pr-14"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      litros
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Pratica atividade física?</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPraticaAtividade(true)}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                      praticaAtividade === true
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50'
                    )}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPraticaAtividade(false);
                      setAtividadeDescricao('');
                    }}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                      praticaAtividade === false
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50'
                    )}
                  >
                    Não
                  </button>
                </div>

                {praticaAtividade && (
                  <Input
                    type="text"
                    value={atividadeDescricao}
                    onChange={(e) => setAtividadeDescricao(e.target.value)}
                    placeholder="Qual atividade e frequência semanal? (Ex: Musculação 3x por semana)"
                    className="border-emerald-200"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações gerais</Label>
                <textarea
                  id="observacoes"
                  rows={4}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Anotações adicionais sobre a rotina do paciente..."
                  className="w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            asChild
            variant="outline"
            className="border-emerald-200 text-emerald-900 hover:bg-emerald-50"
          >
            <Link to="/pacientes">Cancelar</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            <span>Salvar Paciente</span>
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}

