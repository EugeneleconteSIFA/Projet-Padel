'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { getClubSettings, updateClubSettings, type ClubSettingsData } from '@/lib/actions/club';

/* =============================================================================
   /club/parametres — Paramètres du club (nom, contact, adresse).
   ============================================================================= */

type FeedbackState = 'idle' | 'saving' | 'saved' | 'error';

export default function ClubParametresPage() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback]      = useState<FeedbackState>('idle');
  const [errorMsg, setErrorMsg]      = useState('');
  const [loading, setLoading]        = useState(true);

  /* Formulaire */
  const [form, setForm] = useState<ClubSettingsData>({
    name:        '',
    description: '',
    phone:       '',
    email:       '',
    websiteUrl:  '',
    street:      '',
    city:        '',
    postalCode:  '',
  });

  /* Chargement initial */
  useEffect(() => {
    getClubSettings().then(club => {
      if (club) {
        setForm({
          name:        club.name        ?? '',
          description: club.description ?? '',
          phone:       club.phone       ?? '',
          email:       club.email       ?? '',
          websiteUrl:  club.websiteUrl  ?? '',
          street:      club.address?.street     ?? '',
          city:        club.address?.city       ?? '',
          postalCode:  club.address?.postalCode ?? '',
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function set(field: keyof ClubSettingsData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (feedback !== 'idle') setFeedback('idle');
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setFeedback('saving');
    startTransition(async () => {
      const res = await updateClubSettings(form);
      if (res.success) {
        setFeedback('saved');
        setTimeout(() => setFeedback('idle'), 2500);
      } else {
        setErrorMsg(res.error);
        setFeedback('error');
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: 'var(--court-700)' }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">

      {/* ── Retour ── */}
      <Link
        href="/club"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
        style={{ color: 'var(--court-700)' }}
      >
        ← Mon club
      </Link>

      {/* ── En-tête ── */}
      <div className="mb-8">
        <h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)' }}
        >
          Paramètres du club
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Informations affichées sur votre page publique et dans les tournois.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">

        {/* ── Section : Identité ── */}
        <Section title="Identité">
          <Field label="Nom du club *">
            <input
              type="text"
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Padel Club de Lille"
              className="input"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Présentez votre club, vos courts, votre ambiance…"
              className="input resize-none"
            />
          </Field>
        </Section>

        {/* ── Section : Contact ── */}
        <Section title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+33 6 00 00 00 00"
                className="input"
              />
            </Field>
            <Field label="Email de contact">
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="contact@monclub.fr"
                className="input"
              />
            </Field>
          </div>
          <Field label="Site web">
            <input
              type="url"
              value={form.websiteUrl}
              onChange={e => set('websiteUrl', e.target.value)}
              placeholder="https://monclub.fr"
              className="input"
            />
          </Field>
        </Section>

        {/* ── Section : Adresse ── */}
        <Section title="Adresse">
          <Field label="Rue">
            <input
              type="text"
              value={form.street}
              onChange={e => set('street', e.target.value)}
              placeholder="12 rue du Court"
              className="input"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code postal *">
              <input
                type="text"
                value={form.postalCode}
                onChange={e => set('postalCode', e.target.value)}
                placeholder="59000"
                pattern="[0-9]{5}"
                className="input"
              />
            </Field>
            <Field label="Ville *">
              <input
                type="text"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="Lille"
                className="input"
              />
            </Field>
          </div>
        </Section>

        {/* ── Feedback + Bouton ── */}
        {feedback === 'error' && (
          <p
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(166,51,46,.08)', color: 'var(--color-danger)' }}
          >
            {errorMsg}
          </p>
        )}

        {feedback === 'saved' && (
          <p
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ background: 'rgba(15,76,58,.08)', color: 'var(--court-700)' }}
          >
            Modifications enregistrées ✓
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/club"
            className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:opacity-70"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.name.trim()}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: 'var(--court-700)' }}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner /> Enregistrement…
              </span>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </form>

      {/* ── Styles inline ── */}
      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid var(--cream-200);
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          background: var(--off-white);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: var(--court-700);
        }
        .input::placeholder {
          color: var(--text-muted);
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}

/* ── Composants internes ─────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2
        className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--court-700)' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
