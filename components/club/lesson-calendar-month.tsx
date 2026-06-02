'use client';

import { useState, useEffect } from 'react';
import { getLessonSessionsInRange } from '@/lib/actions/club-lessons';

type LessonSession = {
  id: string;
  date: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  cancelReason?: string;
  notes?: string;
  group: {
    id: string;
    name: string;
    audience: string;
    level: string;
    capacity: number;
    coach: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
  court?: {
    id: string;
    name: string;
  };
};

interface LessonCalendarMonthProps {
  initialMonth: Date;
  filters?: {
    coachId?: string;
    courtId?: string;
    level?: string;
  };
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function LessonCalendarMonth({ initialMonth, filters }: LessonCalendarMonthProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [sessions, setSessions] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState(false);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getLessonSessionsInRange(monthStart, monthEnd, filters);
      setSessions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [currentMonth, filters]);

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Grouper les sessions par date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = new Date(session.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, LessonSession[]>);

  // Générer tous les jours du mois
  const getDaysInMonth = () => {
    const days = [];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push(day);
    }
    return days;
  };

  const daysInMonth = getDaysInMonth();

  return (
    <div className="space-y-4">
      {/* Contrôles de navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            ← Mois précédent
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Mois suivant →
          </button>
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
      </div>

      {/* Liste des sessions par date */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chargement...
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {daysInMonth.map(day => {
            const dateKey = day.toISOString().split('T')[0];
            const daySessions = sessionsByDate[dateKey] || [];
            const isToday = day.toDateString() === new Date().toDateString();

            if (daySessions.length === 0) return null;

            return (
              <div key={dateKey} className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                    style={{
                      background: isToday ? 'var(--court-700)' : 'var(--bg-muted)',
                      color: isToday ? 'var(--cream-50)' : 'var(--text-primary)',
                    }}
                  >
                    {day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="space-y-2">
                  {daySessions.map(session => {
                    const sessionDate = new Date(session.date);
                    const timeStr = sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={session.id}
                        className="flex items-start gap-3 rounded-lg border p-3 transition hover:shadow-md"
                        style={{
                          background: session.status === 'CANCELLED' ? 'var(--bg-muted)' : 'var(--bg-page)',
                          borderColor: session.status === 'CANCELLED' ? 'var(--border-subtle)' : 'var(--court-200)',
                          opacity: session.status === 'CANCELLED' ? 0.6 : 1,
                        }}
                      >
                        <div className="shrink-0 text-sm font-mono font-medium" style={{ color: 'var(--court-700)' }}>
                          {timeStr}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {session.group.name}
                            </div>
                            <div
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                background: 'var(--court-100)',
                                color: 'var(--court-700)',
                              }}
                            >
                              {session.group.level}
                            </div>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span>
                              {session.group.coach.firstName} {session.group.coach.lastName}
                            </span>
                            {session.court && <span>· {session.court.name}</span>}
                            <span>· {session.durationMinutes} min</span>
                          </div>
                          {session.status === 'CANCELLED' && session.cancelReason && (
                            <div className="mt-1 text-[10px]" style={{ color: 'var(--color-danger)' }}>
                              Annulé : {session.cancelReason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {daysInMonth.every(day => {
            const dateKey = day.toISOString().split('T')[0];
            return !sessionsByDate[dateKey] || sessionsByDate[dateKey].length === 0;
          }) && (
            <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Aucune session prévue ce mois-ci.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ background: 'var(--bg-page)', border: '1px solid var(--court-200)' }} />
          <span>Programmé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)' }} />
          <span>Annulé</span>
        </div>
      </div>
    </div>
  );
}
