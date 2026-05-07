import React from 'react';
import { useArtistMetrics } from '../hooks/useArtistMetrics';
import { MdPeople } from 'react-icons/md';

export default function ArtistStatBadge({ artistId }) {
  const { data: metrics, isLoading, isError } = useArtistMetrics(artistId);

  if (isLoading) return <div className="animate-pulse bg-white/10 h-6 w-24 rounded-full" />;
  if (isError || !metrics) return null;

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
      <MdPeople className="text-[#ff6b00] text-sm" />
      <span className="text-xs font-black uppercase tracking-widest text-white">
        {metrics.oyentesMensuales ? `${metrics.oyentesMensuales.toLocaleString()} OYENTES` : 'SIN DATOS'}
      </span>
      {metrics.oyentesVerificados && (
        <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" title="Verificado" />
      )}
    </div>
  );
}
