import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createLessonGroup } from '@/lib/actions/club-lessons';
import { listCoaches } from '@/lib/actions/club-coaches';

export const metadata: Metadata = { title: 'Nouveau cours' };

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function NouveauCoursPage() {
  const coaches = await listCoaches().catch(() => []);

  async function handleSubmit(formData: FormData) {
    'use server';
    
    const data = {
      name: formData.get('name') as string,
      audience: formData.get('audience') as 'MIXED' | 'MINI' | 'JUNIOR' | 'TEEN' | 'ADULT' | 'SENIOR',
      level: formData.get('level') as 'INITIATION' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPETITION',
      capacity: parseInt(formData.get('capacity') as string) || 4,
      weekday: parseInt(formData.get('weekday') as string),
      startTime: formData.get('startTime') as string,
      durationMinutes: parseInt(formData.get('durationMinutes') as string) || 60,
      seasonStart: formData.get('seasonStart') as string,
      seasonEnd: formData.get('seasonEnd') as string,
      priceCents: parseInt(formData.get('priceCents') as string) || 0,
      coachId: formData.get('coachId') as string,
      courtId: (formData.get('courtId') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
    };

    const result = await createLessonGroup(data);
    
    if (result.success) {
      redirect('/club/cours');
    }
  }

  // Calculer les dates par défaut (saison septembre N → juin N+1)
  const now = new Date();
  const currentYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const defaultSeasonStart = `${currentYear}-09-01`;
  const defaultSeasonEnd = `${currentYear + 1}-06-30`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      {/* En-tête */}
      <header className="flex items-center gap-4">
        <Link
          href="/club/cours"
          className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          ← Retour
        </Link>
        <div>
          <h1
            className="leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 34px)',
              fontWeight: 500,
            }}
          >
            Nouveau cours
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Créez un nouveau cours récurrent pour votre club
          </p>
        </div>
      </header>

      {/* Formulaire */}
      <form action={handleSubmit} className="space-y-6">
        {/* Section 1 — Identité */}
        <section className="rounded-xl border p-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Identité
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Nom du cours *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="ex: Adultes Intermédiaire — Mardi 19h"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="audience" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Public *
                </label>
                <select
                  id="audience"
                  name="audience"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="ADULT">Adulte (18+)</option>
                  <option value="JUNIOR">Junior (8-12 ans)</option>
                  <option value="TEEN">Ado (13-17 ans)</option>
                  <option value="SENIOR">Senior (50+)</option>
                  <option value="MINI">Mini (5-7 ans)</option>
                  <option value="MIXED">Mixte</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Niveau *
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="INITIATION">Initiation</option>
                  <option value="BEGINNER">Débutant</option>
                  <option value="INTERMEDIATE">Intermédiaire</option>
                  <option value="ADVANCED">Confirmé</option>
                  <option value="COMPETITION">Compétition</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Récurrence */}
        <section className="rounded-xl border p-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Récurrence
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Jour de la semaine *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
                  <label key={day} className="cursor-pointer">
                    <input
                      type="radio"
                      name="weekday"
                      value={index}
                      required
                      className="peer sr-only"
                    />
                    <div className="rounded-lg border px-3 py-2 text-center text-xs font-medium transition peer-checked:border-2 peer-checked:bg-courts-100 peer-checked:text-courts-700">
                      {day}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startTime" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Heure de début *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  defaultValue="19:00"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label htmlFor="durationMinutes" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Durée *
                </label>
                <select
                  id="durationMinutes"
                  name="durationMinutes"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="seasonStart" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Début de saison *
                </label>
                <input
                  type="date"
                  id="seasonStart"
                  name="seasonStart"
                  required
                  defaultValue={defaultSeasonStart}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label htmlFor="seasonEnd" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Fin de saison *
                </label>
                <input
                  type="date"
                  id="seasonEnd"
                  name="seasonEnd"
                  required
                  defaultValue={defaultSeasonEnd}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Logistique */}
        <section className="rounded-xl border p-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Logistique
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="coachId" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Coach *
              </label>
              <select
                id="coachId"
                name="coachId"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Sélectionner un coach</option>
                {coaches?.map((coach: any) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.firstName} {coach.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="courtId" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Terrain (optionnel)
              </label>
              <input
                type="text"
                id="courtId"
                name="courtId"
                placeholder="ID du terrain (optionnel)"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Laisser vide si le terrain n'est pas fixe
              </p>
            </div>

            <div>
              <label htmlFor="capacity" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Capacité maximale *
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                required
                min="1"
                max="4"
                defaultValue="4"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Maximum 4 élèves par cours
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 — Prix */}
        <section className="rounded-xl border p-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Prix
          </h2>
          <div>
            <label htmlFor="priceCents" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Prix par élève sur la saison (€) *
            </label>
            <input
              type="number"
              id="priceCents"
              name="priceCents"
              required
              min="0"
              step="0.01"
              placeholder="ex: 150"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </section>

        {/* Section 5 — Description */}
        <section className="rounded-xl border p-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Description
          </h2>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Description (optionnel)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Détails sur le cours, objectifs, etc."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </section>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            type="submit"
            name="action"
            value="draft"
            className="rounded-lg border px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-px"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            Enregistrer brouillon
          </button>
          <button
            type="submit"
            name="action"
            value="publish"
            className="rounded-lg border px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-px"
            style={{
              background: 'var(--court-700)',
              borderColor: 'var(--court-600)',
              color: 'var(--cream-50)',
            }}
          >
            Publier
          </button>
        </div>
      </form>
    </div>
  );
}
