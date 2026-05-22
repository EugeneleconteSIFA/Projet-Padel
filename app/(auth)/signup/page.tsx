'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { signup } from '@/lib/actions/auth';

/* =============================================================================
   The Court — Page inscription — formulaire 3 étapes.
   Étape 1 : Identité (prénom, nom, email, mdp, ville, code postal)
   Étape 2 : Profil padel (licence FFT, classement, main dominante, côté préféré)
   Étape 3 : Type de compte (joueur / club / juge-arbitre)
   TODO: brancher Server Action → Prisma → Auth.js v5
   ============================================================================= */

/* ── Types ─────────────────────────────────────────────────────────────────── */

type AccountType = 'joueur' | 'club' | 'arbitre';
type Side        = 'droite' | 'gauche' | 'les deux';
type Hand        = 'droitier' | 'gaucher';
type Level       = 'P25' | 'P100' | 'P250' | 'P500' | 'P1000' | 'P2000';

interface Step1 {
  prenom:    string;
  nom:       string;
  email:     string;
  password:  string;
  confirm:   string;
  ville:     string;
  cp:        string;
}

interface Step2 {
  licence:   string;
  classement: Level;
  main:      Hand;
  cote:      Side;
  partenaire: boolean;
}

interface Step3 {
  accountType: AccountType;
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const LEVELS: Level[] = ['P25', 'P100', 'P250', 'P500', 'P1000', 'P2000'];

const ACCOUNT_TYPES: {
  id: AccountType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'joueur',
    label: 'Joueur',
    description: "Je cherche des tournois, je m'inscris, je suis mes résultats.",
    icon: <RacketIcon />,
  },
  {
    id: 'club',
    label: 'Club',
    description: "Je gère un club, je crée des tournois, j'encaisse les inscriptions.",
    icon: <BuildingIcon />,
  },
  {
    id: 'arbitre',
    label: 'Juge-arbitre',
    description: "J'officie des tournois, je génère les tableaux, je saisis les scores.",
    icon: <WhistleIcon />,
  },
];

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function SignupPage() {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  const [s1, setS1] = useState<Step1>({
    prenom: '', nom: '', email: '', password: '', confirm: '', ville: '', cp: '',
  });
  const [s2, setS2] = useState<Step2>({
    licence: '', classement: 'P100', main: 'droitier', cote: 'les deux', partenaire: false,
  });
  const [s3, setS3] = useState<Step3>({ accountType: 'joueur' });

  /* ── Validation ────────────────────────────────────────────────────────── */

  function canAdvanceStep1() {
    return s1.prenom && s1.nom && s1.email && s1.password.length >= 8 &&
      s1.password === s1.confirm && s1.ville && s1.cp;
  }
  function canAdvanceStep2() {
    return true; // tout optionnel sauf choix déjà initialisé
  }

  /* ── Submit ─────────────────────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const roleMap = { joueur: 'PLAYER', club: 'CLUB', arbitre: 'REFEREE' } as const;

    /* 1. Crée le compte côté serveur */
    const res = await signup({
      firstName:         s1.prenom,
      lastName:          s1.nom,
      email:             s1.email,
      password:          s1.password,
      city:              s1.ville,
      postalCode:        s1.cp,
      role:              roleMap[s3.accountType],
      licenceFFT:        s2.licence || undefined,
      classement:        s2.classement,
      hand:              s2.main,
      side:              s2.cote,
      lookingForPartner: s2.partenaire,
    });

    if (!res.success) {
      setLoading(false);
      setError(res.error);
      return;
    }

    /* 2. Connexion automatique côté client — pose le cookie de session */
    const redirectTo =
      s3.accountType === 'club'    ? '/club' :
      s3.accountType === 'arbitre' ? '/arbitre' :
      '/profil';

    await signIn('credentials', {
      email:       s1.email,
      password:    s1.password,
      callbackUrl: redirectTo,
    });
    /* signIn redirige automatiquement via callbackUrl — pas besoin de router.push */
  }

  if (done) return <SuccessScreen email={s1.email} />;

  return (
    <div>
      {/* Lien retour desktop */}
      <Link
        href="/"
        className="mb-8 hidden items-center gap-1.5 text-sm font-medium transition hover:underline md:inline-flex"
        style={{ color: 'var(--court-600)' }}
      >
        ← Retour aux tournois
      </Link>

      {/* Titre */}
      <h1
        className="tracking-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 500 }}
      >
        Créer un compte
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        Déjà inscrit ?{' '}
        <Link
          href="/login"
          className="font-medium transition hover:underline"
          style={{ color: 'var(--court-700)' }}
        >
          Se connecter →
        </Link>
      </p>

      {/* Progress */}
      <StepProgress current={step} total={3} labels={['Identité', 'Profil padel', 'Type de compte']} />

      {/* ── ÉTAPE 1 ──────────────────────────────────────────────────────── */}
      {step === 1 && (
        <form
          onSubmit={e => { e.preventDefault(); if (canAdvanceStep1()) setStep(2); }}
          className="mt-6 space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom" htmlFor="prenom">
              <TextInput
                id="prenom"
                autoComplete="given-name"
                value={s1.prenom}
                onChange={v => setS1(p => ({ ...p, prenom: v }))}
                placeholder="Hugo"
                required
              />
            </Field>
            <Field label="Nom" htmlFor="nom">
              <TextInput
                id="nom"
                autoComplete="family-name"
                value={s1.nom}
                onChange={v => setS1(p => ({ ...p, nom: v }))}
                placeholder="Dupont"
                required
              />
            </Field>
          </div>

          <Field label="Adresse email" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              value={s1.email}
              onChange={v => setS1(p => ({ ...p, email: v }))}
              placeholder="vous@exemple.fr"
              required
            />
          </Field>

          <Field label="Mot de passe" htmlFor="password" hint="8 caractères minimum">
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={s1.password}
              onChange={v => setS1(p => ({ ...p, password: v }))}
            />
          </Field>

          <Field label="Confirmer le mot de passe" htmlFor="confirm">
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={s1.confirm}
              onChange={v => setS1(p => ({ ...p, confirm: v }))}
              error={s1.confirm.length > 0 && s1.password !== s1.confirm
                ? 'Les mots de passe ne correspondent pas'
                : undefined}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ville" htmlFor="ville">
              <TextInput
                id="ville"
                autoComplete="address-level2"
                value={s1.ville}
                onChange={v => setS1(p => ({ ...p, ville: v }))}
                placeholder="Lille"
                required
              />
            </Field>
            <Field label="Code postal" htmlFor="cp">
              <TextInput
                id="cp"
                autoComplete="postal-code"
                value={s1.cp}
                onChange={v => setS1(p => ({ ...p, cp: v }))}
                placeholder="59000"
                required
              />
            </Field>
          </div>

          <StepButton disabled={!canAdvanceStep1()}>
            Continuer — Profil padel →
          </StepButton>
        </form>
      )}

      {/* ── ÉTAPE 2 ──────────────────────────────────────────────────────── */}
      {step === 2 && (
        <form
          onSubmit={e => { e.preventDefault(); setStep(3); }}
          className="mt-6 space-y-5"
          noValidate
        >
          <Field
            label="Numéro de licence FFT"
            htmlFor="licence"
            hint="Optionnel — permet de synchroniser votre classement officiel"
          >
            <TextInput
              id="licence"
              value={s2.licence}
              onChange={v => setS2(p => ({ ...p, licence: v }))}
              placeholder="ex. 0591234567"
              type="text"
            />
          </Field>

          {/* Classement estimé */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Classement estimé
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setS2(p => ({ ...p, classement: l }))}
                  className="rounded-full px-3.5 py-1.5 font-mono text-[12px] font-medium transition"
                  style={{
                    background: s2.classement === l ? 'var(--court-700)' : 'var(--cream-200)',
                    color: s2.classement === l ? 'var(--cream-50)' : 'var(--text-secondary)',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Main dominante */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Main dominante
            </label>
            <div className="flex gap-2">
              {(['droitier', 'gaucher'] as Hand[]).map(h => (
                <ToggleButton
                  key={h}
                  label={h.charAt(0).toUpperCase() + h.slice(1)}
                  active={s2.main === h}
                  onClick={() => setS2(p => ({ ...p, main: h }))}
                />
              ))}
            </div>
          </div>

          {/* Côté préféré */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Côté préféré sur le court
            </label>
            <div className="flex gap-2">
              {(['droite', 'gauche', 'les deux'] as Side[]).map(c => (
                <ToggleButton
                  key={c}
                  label={c.charAt(0).toUpperCase() + c.slice(1)}
                  active={s2.cote === c}
                  onClick={() => setS2(p => ({ ...p, cote: c }))}
                />
              ))}
            </div>
          </div>

          {/* Recherche partenaire */}
          <div className="flex items-center justify-between rounded-xl border p-4"
               style={{ borderColor: 'var(--cream-200)', background: 'var(--off-white)' }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Recherche partenaire
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Visible dans la section « Trouver un partenaire »
              </div>
            </div>
            <Toggle
              value={s2.partenaire}
              onChange={v => setS2(p => ({ ...p, partenaire: v }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-[var(--cream-200)]"
              style={{ borderColor: 'var(--cream-200)', color: 'var(--text-secondary)' }}
            >
              ← Retour
            </button>
            <StepButton>
              Continuer — Type de compte →
            </StepButton>
          </div>
        </form>
      )}

      {/* ── ÉTAPE 3 ──────────────────────────────────────────────────────── */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          {/* Erreur serveur */}
          {error && (
            <div
              className="mb-4 rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: 'var(--color-danger)', background: 'rgba(166,51,46,0.08)', color: 'var(--color-danger)' }}
            >
              {error}
            </div>
          )}
          <div className="space-y-3">
            {ACCOUNT_TYPES.map(t => (
              <AccountTypeCard
                key={t.id}
                {...t}
                selected={s3.accountType === t.id}
                onClick={() => setS3({ accountType: t.id })}
              />
            ))}
          </div>

          {s3.accountType === 'club' && (
            <p
              className="mt-4 rounded-xl border p-3.5 text-sm"
              style={{ borderColor: 'var(--gold-300)', background: 'var(--gold-100)', color: 'var(--ink-700)' }}
            >
              <strong>Compte club</strong> — après inscription, vous pourrez renseigner les informations
              de votre club (terrains, adresse, contact) et créer votre premier tournoi.
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-[var(--cream-200)]"
              style={{ borderColor: 'var(--cream-200)', color: 'var(--text-secondary)' }}
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ background: 'var(--court-700)' }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Création du compte…
                </>
              ) : (
                'Créer mon compte The Court'
              )}
            </button>
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            En créant un compte, vous acceptez nos{' '}
            <Link href="#" className="underline" style={{ color: 'var(--court-600)' }}>
              CGU
            </Link>{' '}
            et notre{' '}
            <Link href="#" className="underline" style={{ color: 'var(--court-600)' }}>
              politique de confidentialité
            </Link>
            .
          </p>
        </form>
      )}
    </div>
  );
}

/* =============================================================================
   COMPOSANTS LOCAUX
   ============================================================================= */

function StepProgress({
  current,
  total,
  labels,
}: {
  current: number;
  total: number;
  labels: string[];
}) {
  return (
    <div className="mt-7">
      <div className="flex justify-between">
        {Array.from({ length: total }, (_, i) => i + 1).map(n => (
          <div key={n} className="flex flex-1 flex-col items-center">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-medium transition-all"
              style={{
                background: n < current
                  ? 'var(--court-700)'
                  : n === current
                  ? 'var(--court-700)'
                  : 'var(--cream-200)',
                color: n <= current ? 'var(--cream-50)' : 'var(--text-muted)',
              }}
            >
              {n < current ? <CheckIcon /> : n}
            </div>
            <span
              className="mt-1 text-center text-[10px] font-medium font-mono uppercase tracking-wide"
              style={{ color: n === current ? 'var(--court-700)' : 'var(--text-muted)' }}
            >
              {labels[n - 1]}
            </span>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div
        className="mt-3 h-0.5 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--cream-200)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${((current - 1) / (total - 1)) * 100}%`,
            background: 'var(--court-700)',
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {hint && (
          <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  id,
  type = 'text',
  autoComplete,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  id: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition"
        style={{
          background: 'var(--off-white)',
          borderColor: error ? 'var(--color-danger)' : 'var(--cream-200)',
          color: 'var(--text-primary)',
        }}
      />
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </>
  );
}

function PasswordInput({
  id,
  autoComplete,
  value,
  onChange,
  error,
}: {
  id: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 pr-11 text-sm font-medium outline-none transition"
          style={{
            background: 'var(--off-white)',
            borderColor: error ? 'var(--color-danger)' : 'var(--cream-200)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border px-4 py-2 text-sm font-medium transition"
      style={{
        background: active ? 'var(--court-700)' : 'var(--off-white)',
        borderColor: active ? 'var(--court-700)' : 'var(--cream-200)',
        color: active ? 'var(--cream-50)' : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-all duration-200"
      style={{ background: value ? 'var(--court-700)' : 'var(--cream-300)' }}
    >
      <span
        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function AccountTypeCard({
  id,
  label,
  description,
  icon,
  selected,
  onClick,
}: {
  id: AccountType;
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-xl border p-4 text-left transition"
      style={{
        borderColor: selected ? 'var(--court-700)' : 'var(--cream-200)',
        background: selected ? 'var(--court-100)' : 'var(--off-white)',
        outline: selected ? '2px solid var(--court-700)' : 'none',
        outlineOffset: '-2px',
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: selected ? 'var(--court-700)' : 'var(--cream-200)',
          color: selected ? 'var(--cream-50)' : 'var(--text-secondary)',
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {description}
        </div>
      </div>
      {selected && (
        <div className="ml-auto shrink-0 text-[var(--court-700)]">
          <CheckCircleIcon />
        </div>
      )}
    </button>
  );
}

function StepButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-40"
      style={{ background: 'var(--court-700)' }}
    >
      {children}
    </button>
  );
}

function SuccessScreen({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--court-100)' }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--court-700)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1
        className="tracking-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500 }}
      >
        Compte créé !
      </h1>
      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        Un email de confirmation a été envoyé à{' '}
        <strong className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {email}
        </strong>
        . Cliquez sur le lien pour activer votre compte.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white"
        style={{ background: 'var(--court-700)' }}
      >
        Découvrir les tournois →
      </Link>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function RacketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 3.18-2.12 5.87-5 6.7V17h1a2 2 0 0 1 0 4h-6a2 2 0 0 1 0-4h1v-1.3A7 7 0 0 1 5 9a7 7 0 0 1 7-7z"/>
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01"/>
    </svg>
  );
}
function WhistleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="13" r="4"/>
      <path d="M12 13h8"/>
      <path d="M18 13a2 2 0 0 0 2-2V7a2 2 0 0 0-4 0v4"/>
      <path d="M6 17v2"/>
    </svg>
  );
}
