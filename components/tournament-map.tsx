'use client';

/* =============================================================================
   TournamentMap — Carte Leaflet + OpenStreetMap des tournois filtrés.
   Importé via next/dynamic (ssr: false) car Leaflet accède à window/document.
   ============================================================================= */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { type Tournament, formatDate, spotsLeft, spotsLabel } from '@/lib/mock-tournaments';

/* Corrige les icônes Leaflet cassées par webpack */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* Icône custom verte */
const courtIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:30px;height:30px;
      background:var(--court-700,#0f4c3a);
      border:2.5px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.25);
    "></div>
  `,
  iconSize:   [30, 30],
  iconAnchor: [15, 30],
  popupAnchor:[1, -32],
});

const courtIconFull = L.divIcon({
  className: '',
  html: `
    <div style="
      width:30px;height:30px;
      background:#a6332e;
      border:2.5px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.25);
    "></div>
  `,
  iconSize:   [30, 30],
  iconAnchor: [15, 30],
  popupAnchor:[1, -32],
});

/* Recadre la carte sur les marqueurs visibles */
function FitBounds({ tournaments }: { tournaments: Tournament[] }) {
  const map = useMap();
  useEffect(() => {
    if (tournaments.length === 0) return;
    const bounds = L.latLngBounds(tournaments.map(t => [t.lat, t.lng]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 10 });
  }, [map, tournaments]);
  return null;
}

interface Props {
  tournaments: Tournament[];
}

export default function TournamentMap({ tournaments }: Props) {
  const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris fallback

  return (
    <MapContainer
      center={defaultCenter}
      zoom={7}
      style={{ width: '100%', height: '480px' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds tournaments={tournaments} />

      {tournaments.map(t => {
        const left = spotsLeft(t);
        const full  = left === 0;
        return (
          <Marker
            key={t.id}
            position={[t.lat, t.lng]}
            icon={full ? courtIconFull : courtIcon}
          >
            <Popup minWidth={180}>
              <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.4 }}>
                {/* Category badge */}
                <span style={{
                  display: 'inline-block',
                  padding: '1px 7px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  background: '#d4e8e0',
                  color: '#0f4c3a',
                  marginBottom: '5px',
                }}>
                  {t.category} · {t.genre}
                </span>

                {/* Nom */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
                  {t.name}
                </div>

                {/* Club + distance */}
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                  {t.club} · {t.distance} km
                </div>

                {/* Date + prix */}
                <div style={{ fontSize: '11px', color: '#444', marginBottom: '6px' }}>
                  📅 {formatDate(t.date)}<br />
                  💶 {t.price} €/équipe · {spotsLabel(t)}
                </div>

                {/* CTA */}
                <Link
                  href={`/tournois/${t.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: full ? '#e5e5e5' : '#0f4c3a',
                    color: full ? '#666' : '#fff',
                    textDecoration: 'none',
                  }}
                >
                  {full ? "Liste d'attente" : 'Voir le tournoi →'}
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
