'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTournament } from '@/lib/actions/club';

/* =============================================================================
   The Court — Créer un tournoi (espace club).
   Formulaire en 3 sections : Identité · Dates & places · Publication.
   ============================================================================= */

type Category = 'P25' | 'P100' | 'P250' | 'P500' | 'P1000' | 'P2000';
type Gender   = 'MEN' | 'WOMEN' | 'MIXED';
type Format   = 'SINGLE_ELIMINATION' | 'POOLS_PLUS_BRACKET' | 'CONSOLATION';

const CATEGORIES: Category[] = ['P25', 'P100', 'P250', 'P500', 'P1000', 'P2000'];

const FORMATS: { value: Format; label: string; desc: string }[] = [
  { value: 'SINGLE_ELIMINATION', label: 'Élimination directe', desc: 'Tableau simple, une défaite = éliminé.' },
  { value: 'POOLS_PLUS_BRACKET', label: 'Poules + tableau',    desc: 'Phase de poules puis tableau final.' },
  { value: 'CONSOLATION',        label: 'Poules + consolante', desc: 'Poules, tableau principal et tableau consolante.' },
];

const MAX_TEAMS_OPTIONS = [4, 8, 12, 16, 24, 32];

export default function NouveauTournoiPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  /* ── Champs ─────────────────────────────────────────────────────────── */
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState<Category>('P100');
  const [gender,      setGender]      = useState<Gender>('MIXED');
  const [format,      setFormat]      = useState<Format>('POOLS_PLUS_BRACKET');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [regOpensAt,  setRegOpensAt]  = useState('');
  const [regClosesAt, setRegClosesAt] = useState('');
  const [maxTeams,    setMaxTeams]    = useState(16);
  const [price,       setPrice]       = useState(40);
  const [publishNow,  setPublishNow]  = useState(false);

  const canSubmit = !!name && !!startDate && !!endDate && price > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await createTournament({
        name,
        description: description || undefined,
        category,
        gender,
        format,
        startDate,
        endDate,
        regOpensAt:  regOpensAt  || undefined,
        regClosesAt: regClosesAt || undefined,
        maxTeams,
        priceEuros: price,
        publishNow,
      });
      if (res.success) {
        router.push('/club');
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      {/* Retour */}
      <Link
        href="/club"
        className="flex items-center gap-1.5 text-sm font-medium transition hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        <ChevronLeftIcon /> Retour au dashboard
      </Link>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}
      >
        Nouveau tournoi
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── SECTION 1 : Identité ──────────────────────────────────────── */}
        <Section title="Identité du tournoi">

          <Field label="Nom du tournoi" htmlFor="name" required>
            <input
              id="name" type="text" required
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Open de Printemps · P100 Mixte"
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Description" htmlFor="description" optional>
            <textarea
              id="description" rows={3}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez l'ambiance, les règles spécifiques, les informations pratiques…"
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </Field>

          {/* Catégorie */}
          <Field label="Catégorie" htmlFor="category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <PillButton key={c} label={c} active={category === c} onClick={() => setCategory(c)} mono />
              ))}
            </div>
          </Field>

          {/* Genre */}
          <Field label="Genre" htmlFor="gender">
            <div className="flex gap-2">
              {([['MIXED','Mixte'],['MEN','Hommes'],['WOMEN','Femmes']] as [Gender,string][]).map(([v,l]) => (
                <PillButton key={v} label={l} active={gender === v} onClick={() => setGender(v)} />
              ))}
            </div>
          </Field>

          {/* Format */}
          <Field label="Format" htmlFor="format">
            <div className="space-y-2">
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className="w-full rounded-xl border px-4 py-3 text-left transition hover:opacity-80"
                  style={{
                    borderColor: format === f.value ? 'var(--court-600)' : 'var(--border-subtle)',
                    background:  format === f.value ? 'rgba(42,130,100,0.08)' : 'var(--bg-page)',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: format === f.value ? 'var(--court-600)' : 'var(--text-primary)' }}>
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── SECTION 2 : Dates & places ────────────────────────────────── */}
        <Section title="Dates et places">

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date de début" htmlFor="startDate" required>
              <input
                id="startDate" type="date" required
                value={startDate} onChange={e => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }}
                className={inputClass} style={inputStyle}
              />
            </Field>
            <Field label="Date de fin" htmlFor="endDate" required>
              <input
                id="endDate" type="date" required
                min={startDate}
                value={endDate} onChange={e => setEndDate(e.target.value)}
                className={inputClass} style={inputStyle}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ouverture inscriptions" htmlFor="regOpensAt" optional>
              <input
                id="regOpensAt" type="date"
                value={regOpensAt} onChange={e => setRegOpensAt(e.target.value)}
                className={inputClass} style={inputStyle}
              />
            </Field>
            <Field label="Fermeture inscriptions" htmlFor="regClosesAt" optional>
              <input
                id="regClosesAt" type="date"
                value={regClosesAt} onChange={e => setRegClosesAt(e.target.value)}
                className={inputClass} style={inputStyle}
              />
            </Field>
          </div>

          {/* Équipes max */}
          <Field label="Nombre d'équipes maximum" htmlFor="maxTeams">
            <div className="flex flex-wrap gap-2">
              {MAX_TEAMS_OPTIONS.map(n => (
                <PillButton key={n} label={String(n)} active={maxTeams === n} onClick={() => setMaxTeams(n)} mono />
              ))}
            </div>
          </Field>

          {/* Prix */}
          <Field label="Prix par équipe (€)" htmlFor="price" required>
            <div className="relative">
              <input
                id="price" type="number" min={0} step={5} required
                value={price} onChange={e => setPrice(Number(e.target.value))}
                className={`${inputClass} pr-10`} style={inputStyle}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>€</span>
            </div>
            {price > 0 && (
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                soit {Math.ceil(price / 2)} € par joueur si paiement partagé · {(price * maxTeams).toFixed(0)} € si complet
              </p>
            )}
          </Field>
        </Section>

        {/* ── SECTION 3 : Publication ────────────────────────────────────── */}
        <Section title="Publication">
          <div className="space-y-3">
            <PublishOption
              active={!publishNow}
              onClick={() => setPublishNow(false)}
              title="Enregistrer en brouillon"
              desc="Le tournoi n'est pas visible par les joueurs. Vous pourrez le publier plus tard."
              icon={<DraftIcon />}
            />
            <PublishOption
              active={publishNow}
              onClick={() => setPublishNow(true)}
              title="Publier immédiatement"
              desc="Le tournoi est visible et les inscriptions s'ouvrent maintenant."
              icon={<PublishIcon />}
            />
          </div>
        </Section>

        {/* Erreur */}
        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: 'var(--color-danger)', background: 'rgba(166,51,46,0.08)', color: 'var(--color-danger)' }}
          >
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3">
          <Link
            href="/club"
            className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--court-700)' }}
          >
            {isPending
              ? 'Enregistrement…'
              : publishNow
              ? 'Publier le tournoi'
              : 'Enregistrer en brouillon'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

const inputClass = 'w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2';
const inputStyle = {
  background:  'var(--bg-page)',
  borderColor: 'var(--border-subtle)',
  color:       'var(--text-primary)',
} as React.CSSProperties;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-5 border-b pb-4 text-base font-semibold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, htmlFor, required = false, optional = false, children,
}: {
  label: string; htmlFor: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--court-600)' }}>*</span>}
        {optional && <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optionnel)</span>}
      </label>
      {children}
    </div>
  );
}

function PillButton({ label, active, onClick, mono = false }: { label: string; active: boolean; onClick: () => void; mono?: boolean }) {
  return (
    <button
      type="button" onClick={onClick}
      className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition hover:opacity-80"
      style={{
        fontFamily:  mono ? 'var(--font-mono)' : undefined,
        borderColor: active ? 'var(--court-600)' : 'var(--border-subtle)',
        background:  active ? 'rgba(42,130,100,0.1)' : 'transparent',
        color:       active ? 'var(--court-600)' : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  );
}

function PublishOption({ active, onClick, title, desc, icon }: {
  active: boolean; onClick: () => void; title: string; desc: string; icon: React.ReactNode;
}) {
  return (
    <button
      type="button" onClick={onClick}
      className="flex w-full items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition hover:opacity-80"
      style={{
        borderColor: active ? 'var(--court-600)' : 'var(--border-subtle)',
        background:  active ? 'rgba(42,130,100,0.08)' : 'var(--bg-page)',
      }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: active ? 'var(--court-600)' : 'var(--text-muted)' }}>{icon}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: active ? 'var(--court-600)' : 'var(--text-primary)' }}>{title}</p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </button>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
function ChevronLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
function DraftIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>;
}
function PublishIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
}
