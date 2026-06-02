'use client';

import { useState } from 'react';
import { getOrCreateDirectConversation, createGroupConversation } from '@/lib/actions/messaging';
import { useRouter } from 'next/navigation';
import { X, Search, Users, MessageSquare } from 'lucide-react';

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export function NewConversationDialog({ open, onClose }: NewConversationDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Player[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // TODO: Implement searchPlayers server action
    // For now, mock results
    setSearchResults([]);
  };

  const handleSelectPlayer = (player: Player) => {
    if (mode === 'direct') {
      startDirectConversation(player.id);
    } else {
      if (!selectedPlayers.find((p) => p.id === player.id)) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
  };

  const startDirectConversation = async (playerId: string) => {
    setLoading(true);
    const result = await getOrCreateDirectConversation(playerId);
    setLoading(false);

    if (result.ok && result.data) {
      router.push(`/messages/${result.data.conversationId}`);
      onClose();
    }
  };

  const startGroupConversation = async () => {
    if (selectedPlayers.length === 0) return;
    if (!groupTitle.trim()) return;

    setLoading(true);
    const result = await createGroupConversation({
      title: groupTitle.trim(),
      participantIds: selectedPlayers.map((p) => p.id),
    });
    setLoading(false);

    if (result.ok && result.data) {
      router.push(`/messages/${result.data.conversationId}`);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[600px] w-full max-w-lg flex-col rounded-lg bg-[var(--bg-base)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Nouvelle discussion</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-[var(--border-subtle)]">
          <button
            onClick={() => setMode('direct')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mode === 'direct'
                ? 'border-b-2 border-[var(--court-700)] text-[var(--court-700)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <MessageSquare className="mr-2 inline h-4 w-4" />
            Message direct
          </button>
          <button
            onClick={() => setMode('group')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mode === 'group'
                ? 'border-b-2 border-[var(--court-700)] text-[var(--court-700)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="mr-2 inline h-4 w-4" />
            Groupe
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'direct' ? (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Rechercher un joueur..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--court-700)]"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-[var(--bg-surface)]"
                    >
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--court-700)] text-[var(--paper-50)]">
                          {player.firstName[0]}{player.lastName[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {player.firstName} {player.lastName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Nom du groupe..."
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="mb-4 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--court-700)]"
              />
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Rechercher des joueurs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--court-700)]"
                />
              </div>
              {selectedPlayers.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 rounded-full bg-[var(--bg-surface)] px-3 py-1"
                    >
                      <span className="text-sm text-[var(--text-primary)]">
                        {player.firstName} {player.lastName}
                      </span>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      disabled={selectedPlayers.find((p) => p.id === player.id) !== undefined}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-[var(--bg-surface)] disabled:opacity-50"
                    >
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--court-700)] text-[var(--paper-50)]">
                          {player.firstName[0]}{player.lastName[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {player.firstName} {player.lastName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {mode === 'group' && selectedPlayers.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] px-6 py-4">
            <button
              onClick={startGroupConversation}
              disabled={!groupTitle.trim() || loading}
              className="w-full rounded-lg bg-[var(--court-700)] py-2 text-[var(--paper-50)] transition-colors hover:bg-[var(--court-700)]/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le groupe'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
