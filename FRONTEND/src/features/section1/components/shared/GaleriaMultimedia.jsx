import { useState, useEffect, useRef } from 'react';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/);
  return match ? match[1] : null;
};

const getYouTubeEmbedUrl = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
};

const isYouTubeUrl = (url) => Boolean(getYouTubeId(url));

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('//')) return url;
  if (url.startsWith('uploads/')) return `/${url}`;
  return url;
};

// ─── PanoramaViewer ─────────────────────────────────────────────────────────────
const PanoramaViewer = ({ url }) => {
  const divRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = () => {
      if (!isMounted || !divRef.current) return;
      try {
        viewerRef.current = window.pannellum.viewer(divRef.current, {
          type: 'equirectangular',
          panorama: resolveUrl(url),
          autoLoad: true,
          showControls: true,
          hfov: 100,
        });
        setLoading(false);
      } catch (e) {
        console.error('Pannellum error:', e);
        setError(true);
        setLoading(false);
      }
    };

    // Load CSS
    if (!document.querySelector('link[href*="pannellum.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }

    // Load JS
    if (window.pannellum) {
      init();
    } else if (!document.querySelector('script[src*="pannellum.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.onload = () => { if (isMounted) init(); };
      script.onerror = () => { if (isMounted) { setError(true); setLoading(false); } };
      document.body.appendChild(script);
    } else {
      // Script tag exists but not yet loaded — poll
      const interval = setInterval(() => {
        if (window.pannellum) {
          clearInterval(interval);
          if (isMounted) init();
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch (_) {}
        viewerRef.current = null;
      }
    };
  }, [url]);

  if (error) {
    return (
      <img
        src={resolveUrl(url)}
        alt="Panorámica"
        className="w-full h-72 object-cover rounded-xl"
        onError={(e) => { e.target.src = '/placeholder.svg'; }}
      />
    );
  }

  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden bg-gray-900">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
        </div>
      )}
      <div ref={divRef} className="w-full h-full" />
    </div>
  );
};

// ─── Lightbox ───────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  const item = images[current];
  const url = resolveUrl(item?.url || item);

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 z-10 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      <div className="max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={url}
          alt={item?.title || `Imagen ${current + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-xl"
          onError={(e) => { e.target.src = '/placeholder.svg'; }}
        />
        {item?.title && (
          <p className="text-white text-center mt-3 font-semibold">{item.title}</p>
        )}
        {images.length > 1 && (
          <p className="text-gray-400 text-center mt-1 text-sm">{current + 1} / {images.length}</p>
        )}
      </div>
    </div>
  );
};

// ─── Tab: Fotos ─────────────────────────────────────────────────────────────────
const TabFotos = ({ items }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sorted.map((item, i) => (
          <div
            key={item._id || i}
            className="relative overflow-hidden rounded-xl cursor-pointer group aspect-square"
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={resolveUrl(item.url)}
              alt={item.title || `Foto ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => { e.target.src = '/placeholder.svg'; }}
            />
            {item.is_360 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">360°</div>
            )}
            {item.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox images={sorted} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
};

// ─── Tab: Videos ────────────────────────────────────────────────────────────────
const TabVideos = ({ items }) => {
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div className="space-y-6">
      {sorted.map((item, i) => {
        const embedUrl = getYouTubeEmbedUrl(item.url);
        const resolved = resolveUrl(item.url);
        return (
          <div key={item._id || i} className="rounded-xl overflow-hidden bg-black shadow-md">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={item.title || `Video ${i + 1}`}
                className="w-full aspect-video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full aspect-video bg-black">
                <source src={resolved} />
                Tu navegador no soporta la reproducción de video.
              </video>
            )}
            {item.title && (
              <div className="bg-white px-4 py-2">
                <p className="font-semibold text-gray-800">{item.title}</p>
                {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tab: Panorámicas ───────────────────────────────────────────────────────────
const TabPanoramicas = ({ items }) => {
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const [current, setCurrent] = useState(0);

  if (sorted.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + sorted.length) % sorted.length);
  const next = () => setCurrent((c) => (c + 1) % sorted.length);
  const item = sorted[current];

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Visor 360° */}
      <PanoramaViewer key={item._id || current} url={item.url} />

      {/* Controles del carrusel */}
      {sorted.length > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          {/* Flecha anterior */}
          <button
            onClick={prev}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Puntos indicadores */}
          <div className="flex items-center gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'w-5 h-2 bg-red-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Flecha siguiente */}
          <button
            onClick={next}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Título / descripción */}
      {(item.title || item.description) && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {item.title && <p className="font-semibold text-gray-800">{item.title}</p>}
              {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
            </div>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-3">
              Vista 360°
            </span>
          </div>
          {sorted.length > 1 && (
            <p className="text-xs text-gray-400 mt-1">{current + 1} / {sorted.length}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Videos 360° ───────────────────────────────────────────────────────────
const TabVideos360 = ({ items }) => {
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div className="space-y-6">
      {sorted.map((item, i) => {
        const embedUrl = getYouTubeEmbedUrl(item.url);
        const resolved = resolveUrl(item.url);
        return (
          <div key={item._id || i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={item.title || `Video 360° ${i + 1}`}
                  className="w-full aspect-video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="w-full aspect-video bg-black">
                  <source src={resolved} />
                </video>
              )}
              {item.is_360 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow">360°</div>
              )}
            </div>
            {(item.title || item.description) && (
              <div className="px-4 py-3">
                {item.title && <p className="font-semibold text-gray-800">{item.title}</p>}
                {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tab: Audio ─────────────────────────────────────────────────────────────────
const TabAudio = ({ items }) => {
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div className="space-y-4">
      {sorted.map((item, i) => (
        <div key={item._id || i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl">🎵</div>
          <div className="flex-1 min-w-0">
            {item.title && <p className="font-semibold text-gray-800 truncate mb-1">{item.title}</p>}
            {item.description && <p className="text-xs text-gray-500 truncate mb-2">{item.description}</p>}
            <audio controls className="w-full">
              <source src={resolveUrl(item.url)} />
              Tu navegador no soporta la reproducción de audio.
            </audio>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Tab: Enlaces ───────────────────────────────────────────────────────────────
const TabEnlaces = ({ items }) => {
  const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sorted.map((item, i) => (
        <a
          key={item._id || i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-red-300 hover:shadow-md transition flex items-start gap-3"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl group-hover:bg-blue-100 transition">🔗</div>
          <div className="flex-1 min-w-0">
            {item.title ? (
              <p className="font-semibold text-gray-800 group-hover:text-red-700 transition truncate">{item.title}</p>
            ) : (
              <p className="font-semibold text-blue-600 group-hover:text-red-700 transition truncate">{item.url}</p>
            )}
            {item.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{item.description}</p>}
            {item.title && <p className="text-xs text-gray-400 mt-1 truncate">{item.url}</p>}
          </div>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ))}
    </div>
  );
};

// ─── GaleriaMultimedia ──────────────────────────────────────────────────────────
const TAB_CONFIG = [
  { key: 'imagenes',        label: 'Fotos',       icon: '📷', component: TabFotos },
  { key: 'videos',          label: 'Videos',      icon: '🎥', component: TabVideos },
  { key: 'panoramicas',     label: 'Panorámicas', icon: '🌄', component: TabPanoramicas },
  { key: 'videos360',       label: '360°',        icon: '🌐', component: TabVideos360 },
  { key: 'audio',           label: 'Audio',       icon: '🎵', component: TabAudio },
  { key: 'enlacesInternos', label: 'Enlaces',     icon: '🔗', component: TabEnlaces },
];

const GaleriaMultimedia = ({ multimedia }) => {
  // Build available tabs (only those with content)
  const availableTabs = TAB_CONFIG.filter((t) => {
    const items = multimedia?.[t.key];
    return Array.isArray(items) && items.length > 0;
  });

  const [activeTab, setActiveTab] = useState(() => availableTabs[0]?.key || null);

  // Update activeTab if multimedia changes and current tab is no longer available
  useEffect(() => {
    if (!availableTabs.find((t) => t.key === activeTab) && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].key);
    }
  }, [multimedia]);

  if (availableTabs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-sm">No hay contenido multimedia disponible.</p>
      </div>
    );
  }

  const ActiveComponent = TAB_CONFIG.find((t) => t.key === activeTab)?.component;
  const activeItems = multimedia?.[activeTab] || [];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto mb-5 border-b border-gray-200 pb-1">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {multimedia?.[tab.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content with fade transition */}
      <div className="transition-opacity duration-200">
        {ActiveComponent && <ActiveComponent items={activeItems} />}
      </div>
    </div>
  );
};

export default GaleriaMultimedia;
