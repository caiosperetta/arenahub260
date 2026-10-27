import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, X, Trash2, MapPin, AlertCircle, Check, Info, Image as ImageIcon } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Toggle from '../components/Toggle';
import { cn } from '../lib/cn';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useQuadras } from '../hooks/useQuadras';
import { SkeletonCard } from '../components/Skeletons';
import type { Court, CourtSlot, OpeningHours } from '../types';

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const FALLBACK_HOURS: number[] = [];
for (let h = 7; h <= 21; h++) FALLBACK_HOURS.push(h);

const sportTypeOptions = ['Society', 'Beach Tennis', 'Futsal', 'Vôlei', 'Tênis'];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

function hourStartTime(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00:00`;
}

function cellKey(weekday: number, hour: number): string {
  return `${weekday}-${hour}`;
}

function timeToHour(time: string): number {
  return Number(time.slice(0, 2));
}

function baseHourRange(openingHours: OpeningHours[]): number[] {
  const openRows = openingHours.filter((h) => h.is_open);
  if (openRows.length === 0) return FALLBACK_HOURS;

  const minHour = Math.min(...openRows.map((h) => timeToHour(h.open_time)));
  const maxHour = Math.max(...openRows.map((h) => timeToHour(h.close_time)));
  if (maxHour <= minHour) return FALLBACK_HOURS;

  const hours: number[] = [];
  for (let h = minHour; h < maxHour; h++) hours.push(h);
  return hours;
}

function selectClassName() {
  return 'w-full rounded-[var(--radius-sm)] border-[0.5px] border-[#CBD5E1] bg-white px-[14px] py-[10px] text-sm text-[var(--color-dark)] outline-none transition-colors focus:border-[1.5px] focus:border-[var(--color-primary)]';
}

function CourtPhoto({ url, className }: { url?: string; className?: string }) {
  if (url) {
    return <img src={url} alt="" className={cn('h-full w-full object-cover', className)} />;
  }
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, var(--color-gray-100) 0px, var(--color-gray-100) 8px, var(--color-gray-200) 8px, var(--color-gray-200) 16px)',
      }}
    >
      <span className="font-mono text-[11px] text-[var(--color-gray-400)]">foto da quadra</span>
    </div>
  );
}

interface CourtFormState {
  name: string;
  sport_type: string;
  price_per_hour: string;
}

const emptyForm: CourtFormState = { name: '', sport_type: sportTypeOptions[0], price_per_hour: '' };

export default function Quadras() {
  const {
    courts,
    slots,
    openingHours,
    loading,
    openingHoursLoading,
    error,
    toggleActive,
    createCourt,
    updateCourt,
    deleteCourt,
    createSlot,
    deleteSlot,
    uploadCourtPhoto,
    refetch,
  } = useQuadras();

  const [scheduleCourtId, setScheduleCourtId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [form, setForm] = useState<CourtFormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [batchSaving, setBatchSaving] = useState(false);
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<'select' | 'deselect'>('select');

  const isLoading = loading || openingHoursLoading;

  useAdminHeader({
    title: 'Quadras',
    subtitle: isLoading ? 'Carregando quadras...' : `${courts.length} quadra${courts.length === 1 ? '' : 's'} cadastrada${courts.length === 1 ? '' : 's'}`,
    action: (
      <Button variant="primary" onClick={() => openCreateModal()}>
        <Plus size={16} strokeWidth={1.5} />
        Nova quadra
      </Button>
    ),
  });

  const activeCourtId = useMemo(() => {
    if (scheduleCourtId && courts.some((c) => c.id === scheduleCourtId)) return scheduleCourtId;
    return courts[0]?.id ?? null;
  }, [scheduleCourtId, courts]);

  const activeCourtSlots = activeCourtId ? (slots[activeCourtId] ?? []) : [];

  const openingHoursByWeekday = useMemo(() => {
    const map = new Map<number, OpeningHours>();
    for (const row of openingHours) map.set(row.weekday, row);
    return map;
  }, [openingHours]);

  function isWithinOpeningHours(weekday: number, hour: number): boolean {
    const row = openingHoursByWeekday.get(weekday);
    if (!row || !row.is_open) return false;
    return hour >= timeToHour(row.open_time) && hour < timeToHour(row.close_time);
  }

  function isCellClickable(weekday: number, hour: number): boolean {
    return isWithinOpeningHours(weekday, hour) || Boolean(findSlot(weekday, hour));
  }

  const displayHours = useMemo(() => {
    const base = baseHourRange(openingHours);
    const slotHours = activeCourtSlots.map((s) => timeToHour(s.start_time));
    return Array.from(new Set([...base, ...slotHours])).sort((a, b) => a - b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openingHours, activeCourtSlots]);

  const defaultSelection = useMemo(() => {
    const set = new Set<string>();
    for (const hour of displayHours) {
      for (let weekday = 0; weekday < 7; weekday++) {
        const hasSlot = activeCourtSlots.some(
          (s) => s.weekday === weekday && s.start_time.slice(0, 5) === hourStartTime(hour).slice(0, 5),
        );
        if (hasSlot || isWithinOpeningHours(weekday, hour)) set.add(cellKey(weekday, hour));
      }
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayHours, activeCourtSlots, openingHoursByWeekday]);

  const pendingChangesCount = useMemo(() => {
    let count = 0;
    for (const key of selectedCells) if (!defaultSelection.has(key)) count++;
    for (const key of defaultSelection) if (!selectedCells.has(key)) count++;
    return count;
  }, [selectedCells, defaultSelection]);

  useEffect(() => {
    setSelectedCells(defaultSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourtId]);

  useEffect(() => {
    function handleWindowMouseUp() {
      isDraggingRef.current = false;
    }
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, []);

  function openCreateModal() {
    setEditingCourt(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setModalError(null);
    setShowModal(true);
  }

  function openEditModal(court: Court) {
    setEditingCourt(court);
    setForm({ name: court.name, sport_type: court.sport_type, price_per_hour: String(court.price_per_hour) });
    setPhotoFile(null);
    setPhotoPreview(court.photo_url ?? null);
    setModalError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCourt(null);
    setModalError(null);
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setModalError(null);

    const price = Number(form.price_per_hour.replace(',', '.'));
    if (!form.name.trim()) {
      setModalError('Informe o nome da quadra.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setModalError('Informe um preço por hora válido.');
      return;
    }

    setSubmitting(true);
    try {
      let courtId: string;
      if (editingCourt) {
        await updateCourt(editingCourt.id, { name: form.name.trim(), sport_type: form.sport_type, price_per_hour: price });
        courtId = editingCourt.id;
      } else {
        const created = await createCourt({ name: form.name.trim(), sport_type: form.sport_type, price_per_hour: price });
        courtId = created.id;
      }

      if (photoFile) {
        await uploadCourtPhoto(courtId, photoFile);
      }

      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Erro ao salvar quadra');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCourt() {
    if (!editingCourt) return;
    if (!window.confirm(`Excluir a quadra "${editingCourt.name}"? Esta ação também remove seus horários.`)) return;

    setDeleting(true);
    try {
      await deleteCourt(editingCourt.id);
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Erro ao excluir quadra');
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(court: Court) {
    setTogglingId(court.id);
    try {
      await toggleActive(court.id, court.active);
    } catch (err) {
      console.error('Erro ao atualizar quadra:', err);
    } finally {
      setTogglingId(null);
    }
  }

  function findSlot(weekday: number, hour: number) {
    const startTime = hourStartTime(hour);
    return activeCourtSlots.find((s) => s.weekday === weekday && s.start_time.slice(0, 5) === startTime.slice(0, 5));
  }

  function applyCell(weekday: number, hour: number, mode: 'select' | 'deselect') {
    setSelectedCells((prev) => {
      const key = cellKey(weekday, hour);
      const shouldSelect = mode === 'select';
      if (shouldSelect === prev.has(key)) return prev;
      const next = new Set(prev);
      if (shouldSelect) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function handleCellMouseDown(weekday: number, hour: number) {
    if (!isCellClickable(weekday, hour)) return;
    const mode: 'select' | 'deselect' = selectedCells.has(cellKey(weekday, hour)) ? 'deselect' : 'select';
    dragModeRef.current = mode;
    isDraggingRef.current = true;
    applyCell(weekday, hour, mode);
  }

  function handleCellMouseEnter(weekday: number, hour: number) {
    if (!isDraggingRef.current || !isCellClickable(weekday, hour)) return;
    applyCell(weekday, hour, dragModeRef.current);
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLDivElement>, weekday: number, hour: number) {
    if ((event.key !== 'Enter' && event.key !== ' ') || !isCellClickable(weekday, hour)) return;
    event.preventDefault();
    const mode: 'select' | 'deselect' = selectedCells.has(cellKey(weekday, hour)) ? 'deselect' : 'select';
    applyCell(weekday, hour, mode);
  }

  function handleCancelPending() {
    setSelectedCells(defaultSelection);
  }

  function handleClearSelection() {
    setSelectedCells(new Set());
  }

  function handleSelectAllWithinHours() {
    setSelectedCells((prev) => {
      const next = new Set(prev);
      for (const hour of displayHours) {
        for (let weekday = 0; weekday < 7; weekday++) {
          if (isWithinOpeningHours(weekday, hour)) next.add(cellKey(weekday, hour));
        }
      }
      return next;
    });
  }

  async function handleSaveAgenda() {
    if (!activeCourtId) return;
    setBatchSaving(true);
    try {
      const toCreate: { weekday: number; hour: number }[] = [];
      const toDelete: CourtSlot[] = [];

      for (const hour of displayHours) {
        for (let weekday = 0; weekday < 7; weekday++) {
          const existing = findSlot(weekday, hour);
          const isSelected = selectedCells.has(cellKey(weekday, hour));
          if (isSelected && !existing) toCreate.push({ weekday, hour });
          if (!isSelected && existing) toDelete.push(existing);
        }
      }

      await Promise.all([
        ...toCreate.map(({ weekday, hour }) =>
          createSlot({ court_id: activeCourtId, weekday, start_time: hourStartTime(hour), end_time: hourStartTime(hour + 1), active: true }),
        ),
        ...toDelete.map((slot) => deleteSlot(slot.id)),
      ]);
      refetch();
    } catch (err) {
      console.error('Erro ao salvar agenda:', err);
    } finally {
      setBatchSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">
      {error && (
        <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex flex-col gap-3 p-4">
              <SkeletonCard className="h-[100px]" />
              <SkeletonCard className="h-4 w-2/3" />
              <SkeletonCard className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && courts.length === 0 && (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-gray-400)]">
          <MapPin size={24} strokeWidth={1.5} />
          <span className="text-sm">Nenhuma quadra cadastrada</span>
          <Button variant="primary" onClick={() => openCreateModal()}>
            <Plus size={16} strokeWidth={1.5} />
            Adicionar quadra
          </Button>
        </Card>
      )}

      {!isLoading && courts.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {courts.map((court) => (
            <motion.div key={court.id} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden p-0">
                <div className="h-[100px]">
                  <CourtPhoto url={court.photo_url} />
                </div>
                <div className="p-4">
                  <div className="mb-1.5 flex items-start justify-between">
                    <div className="text-[15px] text-[var(--color-dark)]">{court.name}</div>
                    <button
                      type="button"
                      title="Editar quadra"
                      aria-label="Editar quadra"
                      className="cursor-pointer border-none bg-transparent p-0"
                      onClick={() => openEditModal(court)}
                    >
                      <Pencil size={15} strokeWidth={1.5} color="var(--color-gray-600)" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge status="info">{court.sport_type}</Badge>
                    <Badge status="inactive">{(slots[court.id] ?? []).length} horários</Badge>
                  </div>
                  <div className="my-3 text-sm text-[var(--color-gray-600)]">{formatPrice(court.price_per_hour)}/hora</div>
                  <div className="flex items-center justify-between border-t border-[var(--color-gray-100)] pt-3">
                    <span className="text-[13px] text-[var(--color-dark)]">{court.active ? 'Ativa' : 'Inativa'}</span>
                    <Toggle
                      on={court.active}
                      disabled={togglingId === court.id}
                      onToggle={() => handleToggleActive(court)}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && courts.length > 0 && (
        <Card className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[15px] text-[var(--color-dark)]">Agenda semanal</div>
            <div className="flex flex-wrap gap-2">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setScheduleCourtId(court.id)}
                  className={cn(
                    'cursor-pointer rounded-[var(--radius-md)] px-3.5 py-1.5 text-[13px] font-medium',
                    activeCourtId === court.id
                      ? 'border-none bg-[var(--color-primary)] text-white'
                      : 'border-[0.5px] border-[#CBD5E1] bg-white text-[var(--color-dark)]',
                  )}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>

          {pendingChangesCount > 0 && (
            <div className="mb-3 text-xs text-[var(--color-warning-text)]">
              {pendingChangesCount} alteraç{pendingChangesCount === 1 ? 'ão' : 'ões'} pendente{pendingChangesCount === 1 ? '' : 's'}
            </div>
          )}

          <div className="select-none overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-gray-200)]">
            <div className="grid grid-cols-[70px_repeat(7,1fr)]">
              <div className="bg-[var(--color-gray-50)] p-2" />
              {weekdayLabels.map((d) => (
                <div key={d} className="border-l border-[var(--color-gray-200)] bg-[var(--color-gray-50)] p-2 text-center">
                  <span className="text-xs text-[var(--color-dark)]">{d}</span>
                </div>
              ))}
            </div>
            {displayHours.map((hour) => {
              const label = `${String(hour).padStart(2, '0')}:00`;
              return (
                <div key={hour} className="grid grid-cols-[70px_repeat(7,1fr)] border-t border-[var(--color-gray-200)]">
                  <div className="border-r border-[var(--color-gray-200)] px-2 py-1.5 text-[11px] text-[var(--color-gray-400)]">
                    {label}
                  </div>
                  {weekdayLabels.map((_, weekday) => {
                    const clickable = isCellClickable(weekday, hour);
                    const isSelected = selectedCells.has(cellKey(weekday, hour));

                    return (
                      <div
                        key={weekday}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : -1}
                        aria-disabled={!clickable}
                        onMouseDown={() => handleCellMouseDown(weekday, hour)}
                        onMouseEnter={() => handleCellMouseEnter(weekday, hour)}
                        onKeyDown={(e) => handleCellKeyDown(e, weekday, hour)}
                        className={cn(
                          'relative border-l border-[var(--color-gray-200)] px-1.5 py-1.5 text-center transition-colors',
                          clickable ? 'cursor-pointer' : 'cursor-default',
                        )}
                        style={{
                          backgroundColor: !clickable ? '#E2E8F0' : isSelected ? '#DCFCE7' : '#F1F5F9',
                        }}
                      >
                        {!clickable ? (
                          <span className="text-[11px] text-[#94A3B8]">—</span>
                        ) : isSelected ? (
                          <Check size={13} strokeWidth={2.25} color="#15803D" className="mx-auto" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-1.5 text-xs text-[var(--color-gray-400)]">
            <Info size={13} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            <span>
              Baseado no horário de funcionamento da arena. Para alterar, acesse{' '}
              <Link to="/app/configuracoes?tab=Horários" className="text-[var(--color-primary)] hover:underline">
                Configurações → Horários
              </Link>
              .
            </span>
          </div>

          <AnimatePresence>
            {pendingChangesCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2 }}
                className="sticky bottom-4 z-10 mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-gray-200)] bg-white px-4 py-3 shadow-[var(--shadow-modal)]"
              >
                <span className="text-sm text-[var(--color-dark)]">
                  {selectedCells.size} horário{selectedCells.size === 1 ? '' : 's'} selecionado{selectedCells.size === 1 ? '' : 's'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3.5 py-2 text-[13px]"
                    disabled={batchSaving}
                    onClick={handleCancelPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost-destructive"
                    className="px-3.5 py-2 text-[13px]"
                    disabled={batchSaving}
                    onClick={handleClearSelection}
                  >
                    Limpar seleção
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3.5 py-2 text-[13px]"
                    disabled={batchSaving}
                    onClick={handleSelectAllWithinHours}
                  >
                    Selecionar tudo (dentro do horário)
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="px-3.5 py-2 text-[13px]"
                    disabled={batchSaving}
                    onClick={handleSaveAgenda}
                  >
                    {batchSaving ? 'Salvando...' : 'Salvar agenda'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="court-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 z-10 bg-[rgba(15,23,42,0.4)]"
            />
            <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
              <motion.div
                key="court-modal-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-[420px]"
              >
                <Card className="max-h-[85vh] overflow-y-auto p-6 shadow-[var(--shadow-modal)]">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg text-[var(--color-dark)]">{editingCourt ? 'Editar quadra' : 'Nova quadra'}</h2>
                    <button onClick={closeModal} className="cursor-pointer border-none bg-transparent p-0" aria-label="Fechar">
                      <X size={18} strokeWidth={1.5} color="var(--color-gray-600)" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="court-photo" className="text-[13px] text-[var(--color-dark)]">
                        Foto da quadra
                      </label>
                      <div className="h-[200px] overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1]">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Pré-visualização" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[var(--color-gray-50)] text-[var(--color-gray-400)]">
                            <ImageIcon size={22} strokeWidth={1.5} />
                            <span className="text-xs">Nenhuma foto selecionada</span>
                          </div>
                        )}
                      </div>
                      <input
                        id="court-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="text-[13px] text-[var(--color-gray-600)] file:mr-3 file:cursor-pointer file:rounded-[var(--radius-sm)] file:border-none file:bg-[var(--color-gray-100)] file:px-3 file:py-1.5 file:text-[13px] file:text-[var(--color-dark)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="court-name" className="text-[13px] text-[var(--color-dark)]">
                        Nome
                      </label>
                      <Input
                        id="court-name"
                        placeholder="Quadra 1"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="court-sport" className="text-[13px] text-[var(--color-dark)]">
                        Tipo de esporte
                      </label>
                      <select
                        id="court-sport"
                        value={form.sport_type}
                        onChange={(e) => setForm((prev) => ({ ...prev, sport_type: e.target.value }))}
                        className={selectClassName()}
                      >
                        {sportTypeOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="court-price" className="text-[13px] text-[var(--color-dark)]">
                        Preço por hora (R$)
                      </label>
                      <Input
                        id="court-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="80,00"
                        value={form.price_per_hour}
                        onChange={(e) => setForm((prev) => ({ ...prev, price_per_hour: e.target.value }))}
                        required
                      />
                    </div>

                    {modalError && <span className="text-[12px] text-[var(--color-error)]">{modalError}</span>}

                    <div className="mt-2 flex items-center justify-between gap-3">
                      {editingCourt ? (
                        <Button
                          type="button"
                          variant="ghost-destructive"
                          className="px-3.5 py-2 text-[13px]"
                          disabled={deleting || submitting}
                          onClick={handleDeleteCourt}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                          {deleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                      ) : (
                        <span />
                      )}
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting || deleting}>
                          Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting || deleting}>
                          {submitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
