'use client';

import { useState, useTransition } from 'react';
import { searchReferees, assignReferee, removeRefereeAssignment } from '@/lib/actions/referee';
import { db } from '@/lib/db';

type RefereeAssignment = {
  id: string;
  refereeProfileId: string;
  isHead: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  referee: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  };
};

export function RefereeSection({ 
  editionId, 
  tournamentName,
  initialAssignments 
}: { 
  editionId: string; 
  tournamentName: string;
  initialAssignments: RefereeAssignment[];
}) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedReferee, setSelectedReferee] = useState<any | null>(null);
  const [isHead, setIsHead] = useState(false);
  const [assignments, setAssignments] = useState<RefereeAssignment[]>(initialAssignments);
  const [error, setError] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await searchReferees(query);
    setSearchResults(results);
  };

  const handleSelectReferee = (referee: any) => {
    setSelectedReferee(referee);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAssign = () => {
    if (!selectedReferee) return;
    setError('');
    startTransition(async () => {
      const res = await assignReferee(editionId, selectedReferee.refereeProfile?.id, isHead);
      if (res.success) {
        const newAssignment: RefereeAssignment = {
          id: res.id!,
          refereeProfileId: selectedReferee.refereeProfile?.id,
          isHead,
          status: 'PENDING',
          referee: {
            user: {
              firstName: selectedReferee.firstName,
              lastName: selectedReferee.lastName,
              email: selectedReferee.email,
            },
          },
        };
        setAssignments([...assignments, newAssignment]);
        setSelectedReferee(null);
        setIsHead(false);
      } else {
        setError(res.error);
      }
    });
  };

  const handleRemove = (assignmentId: string) => {
    setError('');
    startTransition(async () => {
      const res = await removeRefereeAssignment(assignmentId);
      if (res.success) {
        setAssignments(assignments.filter((a) => a.id !== assignmentId));
      } else {
        setError(res.error);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: 'var(--gold-100)', color: 'var(--gold-700)' }}
          >
            En attente
          </span>
        );
      case 'ACCEPTED':
        return (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: 'rgba(42,130,100,0.1)', color: 'var(--court-600)' }}
          >
            Accepté
          </span>
        );
      case 'DECLINED':
        return (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: 'rgba(166,51,46,0.08)', color: 'var(--color-danger)' }}
          >
            Refusé
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Arbitres
      </h2>

      {error && (
        <div
          className="mb-4 rounded-lg border px-3 py-2 text-xs"
          style={{ background: 'rgba(166,51,46,0.08)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un arbitre (nom, email)... minimum 2 caractères"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ background: 'var(--bg-page)', borderColor: 'var(--border-subtle)' }}
          />
          {searchResults.length > 0 && (
            <div
              className="absolute z-10 mt-1 w-full rounded-lg border p-2"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              {searchResults.map((referee) => (
                <button
                  key={referee.id}
                  onClick={() => handleSelectReferee(referee)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-opacity-80"
                  style={{ background: 'var(--bg-page)' }}
                >
                  <p className="font-medium">
                    {referee.firstName} {referee.lastName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {referee.email}
                    {referee.refereeProfile?.certificationLevel && ` · ${referee.refereeProfile.certificationLevel}`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedReferee && (
          <div
            className="rounded-lg border p-3"
            style={{ background: 'var(--bg-page)', borderColor: 'var(--border-subtle)' }}
          >
            <p className="text-sm font-medium">
              {selectedReferee.firstName} {selectedReferee.lastName}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {selectedReferee.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={isHead}
                  onChange={(e) => setIsHead(e.target.checked)}
                  className="rounded"
                />
                Juge-arbitre principal
              </label>
              <button
                onClick={handleAssign}
                disabled={isPending}
                className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--court-700)', color: 'var(--cream-50)' }}
              >
                {isPending ? 'Assignation...' : 'Assigner'}
              </button>
              <button
                onClick={() => {
                  setSelectedReferee(null);
                  setIsHead(false);
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {assignments.length === 0 ? (
            <p className="py-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucun arbitre assigné
            </p>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
                style={{ background: 'var(--bg-page)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {assignment.referee.user.firstName} {assignment.referee.user.lastName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {assignment.referee.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.isHead && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'var(--court-100)', color: 'var(--court-700)' }}
                      >
                        Principal
                      </span>
                    )}
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(assignment.id)}
                  disabled={isPending}
                  className="rounded-lg px-2 py-1 text-xs font-medium transition hover:opacity-80 disabled:opacity-50"
                  style={{ background: 'rgba(166,51,46,0.08)', color: 'var(--color-danger)' }}
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
