'use client';

import { useState } from 'react';
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

interface LessonCalendarWeekProps {
  initialWeekStart: Date;
  filters?: {
    coachId?: string;
    courtId?: string;
    level?: string;
  };
}

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7h à 23h

export function LessonCalendarWeek({ initialWeekStart, filters }: LessonCalendarWeekProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekStart);
  const [sessions, setSessions] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState(false);

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getLessonSessionsInRange(currentWeekStart, weekEnd, filters);
      setSessions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les sessions au montage et quand la semaine change
  useState(() => {
    loadSessions();
  });

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi comme premier jour
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSessionForSlot = (day: Date, hour: number) => {
    const dayStart = new Date(day);
    dayStart.setHours(hour, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(hour + 1, 0, 0, 0);

    return sessions.find(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= dayStart && sessionDate < dayEnd;
    });
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-4">
      {/* Contrôles de navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            ← Semaine précédente
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNextWeek}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Semaine suivante →
          </button>
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Calendrier semaine */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chargement...
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="min-w-[800px]">
            {/* En-tête des jours */}
            <div className="grid grid-cols-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="p-2 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Heure
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="p-2 text-center text-sm font-medium"
                  style={{
                    color: day.toDateString() === new Date().toDateString() ? 'var(--court-700)' : 'var(--text-primary)',
                  }}
                >
                  <div>{WEEKDAYS[index]}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Grille horaire */}
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="p-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  {hour}h
                </div>
                {weekDays.map((day, dayIndex) => {
                  const session = getSessionForSlot(day, hour);
                  return (
                    <div
                      key={dayIndex}
                      className="min-h-[60px] border-r p-1"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      {session && (
                        <div
                          className="rounded-lg border p-2 text-xs transition hover:shadow-md cursor-pointer"
                          style={{
                            background: session.status === 'CANCELLED' ? 'var(--bg-muted)' : 'var(--court-100)',
                            borderColor: session.status === 'CANCELLED' ? 'var(--border-subtle)' : 'var(--court-300)',
                            opacity: session.status === 'CANCELLED' ? 0.6 : 1,
                          }}
                        >
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {session.group.name}
                          </div>
                          <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {session.group.coach.firstName} {session.group.coach.lastName}
                          </div>
                          {session.court && (
                            <div className="mt-1" style={{ color: 'var(--text-muted)' }}>
                              {session.court.name}
                            </div>
                          )}
                          {session.status === 'CANCELLED' && (
                            <div className="mt-1 text-[10px]" style={{ color: 'var(--color-danger)' }}>
                              Annulé
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ background: 'var(--court-100)', border: '1px solid var(--court-300)' }} />
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
