'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateIdentity, updatePadelProfile } from '@/lib/actions/profil';

/* =============================================================================
   The Court — Modifier le profil.
   Deux sections : Identité + Profil padel.
   Sauvegarde section par section via Server Actions.
   ============================================================================= */

type Hand = 'LEFT' | 'RIGHT' | 'AMBIDEXTROUS';
type Side = 'LEFT' | 'RIGHT' | 'BOTH';
type Level = 'P25' | 'P100' | 'P250' | 'P500' | 'P1000' | 'P2000';
const LEVELS: Level[] = ['P25', 'P100', 'P250', 'P500', 'P1000', 'P2000'];

export default function ModifierProfilPage() {
  const router      = useRouter();
  const [isPending, startTransition] = useTransition();

  /* ── État identité ──────────────────────────────────────────────────── */
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [bio,       setBio]       = useState('');

  /* ── État profil padel ──────────────────────────────────────────────── */
  const [level,     setLevel]     = useState<Level>('P100');
  const [hand,      setHand]      = useState<Hand>('RIGHT');
  const [side,      setSide]      = useState<Side>('BOTH');
  const [partner,   setPartner]   = useState(false);

  /* ── Feedback ────────────────────────────────────────────────────────── */
  const [identityMsg, setIdentityMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [padelMsg,    setPadelMsg]    = useState<{ ok: boolean; text: string } | null>(null);

  /* ── Sauvegarde identité ─────────────────────────────────────────────── */
  function saveIdentity() {
    if (!firstName || !lastName) return;
    startTransition(async () => {
      const res = await updateIdentity({ firstName, lastName, phone: phone || undefined, bio: bio || undefined });
      setIdentityMsg(res.success
        ? { ok: true,  text: 'Profil mis à jour.' }
        : { ok: false, text: res.error });
      if (res.success) setTimeout(() => setIdentityMsg(null), 3000);
    });
  }

  /* ── Sauvegarde profil padel ─────────────────────────────────────────── */
  function savePadel() {
    startTransition(async () => {
      const res = await updatePadelProfile({
        dominantHand:      hand,
        preferredSide:     side,
        lookingForPartner: partner,
        estimatedLevel:    level,
      });
      setPadelMsg(res.success
        ? { ok: true,  text: 'Profil padel mis à jour.' }
        : { ok: false, text: res.error });
      if (res.success) setTimeout(() => setPadelMsg(null), 3000);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      {/* Retour */}
      <div className="flex items-center gap-3">
        <Link
          href="/profil"
          className="flex items-center gap-1.5 text-sm font-medium transition hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeftIcon />
          Retour au profil
        </Link>
      </div>

      {/* Titre */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
        }}
      >
        Modifier le profil
      </h1>

      {/* ── SECTION 1 : Identité ────────────────────────────────────────── */}
      <Section
        title="Identité"
        description="Vos informations personnelles visibles sur votre profil."
        onSave={saveIdentity}
        saving={isPending}
        feedback={identityMsg}
        canSave={!!firstName && !!lastName}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" htmlFor="firstname">
            <TextInput
              id="firstname"
              value={firstName}
              onChange={setFirstName}
              placeholder="Hugo"
              autoComplete="given-name"
            />
          </Field>
          <Field label="Nom" htmlFor="lastname">
            <TextInput
              id="lastname"
              value={lastName}
              onChange={setLastName}
              placeholder="Leconte"
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field label="Téléphone" htmlFor="phone" optional>
          <TextInput
            id="phone"
            value={phone}
            onChange={setPhone}
            placeholder="+33 6 12 34 56 78"
            autoComplete="tel"
            type="tel"
          />
        </Field>

        <Field label="Biographie" htmlFor="bio" optional>
          <textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Passionné de padel depuis 3 ans, joueur régulier à Lille…"
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
            style={{
              background: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </Field>
      </Section>

      {/* ── SECTION 2 : Profil padel ────────────────────────────────────── */}
      <Section
        title="Profil padel"
        description="Ces informations permettent de vous trouver des partenaires et de filtrer les tournois."
        onSave={savePadel}
        saving={isPending}
        feedback={padelMsg}
      >
        {/* Classement */}
        <Field label="Classement estimé" htmlFor="level">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map(l => (
              <PillButton
                key={l}
                label={l}
                active={level === l}
                onClick={() => setLevel(l)}
              />
            ))}
          </div>
        </Field>

        {/* Main dominante */}
        <Field label="Main dominante" htmlFor="hand">
          <div className="flex gap-2">
            {([['RIGHT', 'Droitier'], ['LEFT', 'Gaucher'], ['AMBIDEXTROUS', 'Ambidextre']] as [Hand, string][]).map(([val, lbl]) => (
              <PillButton
                key={val}
                label={lbl}
                active={hand === val}
                onClick={() => setHand(val)}
              />
            ))}
          </div>
        </Field>

        {/* Côté préféré */}
        <Field label="Côté préféré" htmlFor="side">
          <div className="flex gap-2">
            {([['RIGHT', 'Côté droit'], ['LEFT', 'Côté gauche'], ['BOTH', 'Les deux']] as [Side, string][]).map(([val, lbl]) => (
              <PillButton
                key={val}
                label={lbl}
                active={side === val}
                onClick={() => setSide(val)}
              />
            ))}
          </div>
        </Field>

        {/* Recherche partenaire */}
        <Field label="Recherche partenaire" htmlFor="partner">
          <button
            type="button"
            onClick={() => setPartner(v => !v)}
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition"
            style={{
              borderColor: partner ? 'var(--court-500)' : 'var(--border-subtle)',
              background:  partner ? 'rgba(42,130,100,0.08)' : 'var(--bg-page)',
              color:       partner ? 'var(--court-600)' : 'var(--text-secondary)',
            }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition"
              style={{
                borderColor:    partner ? 'var(--court-600)' : 'var(--border-strong)',
                background:     partner ? 'var(--court-600)' : 'transparent',
              }}
            >
              {partner && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </span>
            {partner ? 'Disponible — les joueurs peuvent me contacter' : 'Non disponible pour l\'instant'}
          </button>
        </Field>
      </Section>

      {/* ── SECTION 3 : Danger zone ─────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: 'rgba(166,51,46,0.3)', background: 'rgba(166,51,46,0.04)' }}
      >
        <h2 className="mb-1 text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
          Zone de danger
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <button
          type="button"
          className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
          onClick={() => alert('Fonctionnalité disponible en V1.1')}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function Section({
  title,
  description,
  children,
  onSave,
  saving,
  feedback,
  canSave = true,
}: {
  title:       string;
  description: string;
  children:    React.ReactNode;
  onSave:      () => void;
  saving:      boolean;
  feedback:    { ok: boolean; text: string } | null;
  canSave?:    boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-5 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      </div>

      <div className="space-y-4">{children}</div>

      {/* Feedback */}
      {feedback && (
        <div
          className="mt-4 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: feedback.ok ? 'var(--court-300)' : 'var(--color-danger)',
            background:  feedback.ok ? 'rgba(42,130,100,0.08)' : 'rgba(166,51,46,0.08)',
            color:       feedback.ok ? 'var(--court-600)'       : 'var(--color-danger)',
          }}
        >
          {feedback.ok ? '✓ ' : '✗ '}{feedback.text}
        </div>
      )}

      {/* Bouton save */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !canSave}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--court-700)' }}
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label:    string;
  htmlFor:  string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {optional && (
          <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            (optionnel)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = 'text',
}: {
  id:           string;
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  type?:        string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
      style={{
        background:   'var(--bg-page)',
        borderColor:  'var(--border-subtle)',
        color:        'var(--text-primary)',
      }}
    />
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label:   string;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition hover:opacity-80"
      style={{
        borderColor: active ? 'var(--court-600)' : 'var(--border-subtle)',
        background:  active ? 'rgba(42,130,100,0.1)' : 'transparent',
        color:       active ? 'var(--court-600)'      : 'var(--text-secondary)',
        fontFamily:  'var(--font-mono)',
      }}
    >
      {label}
    </button>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
