"use client";

import { useState, useEffect } from "react";

// ── Mapeo de nombre de actividad → icono + colores ──────────────────────────
const DEPORTE_MAP = {
  trekking:     { emoji: "🥾", bg: "bg-yellow-50",  border: "border-yellow-200",  text: "text-yellow-700"  },
  rafting:      { emoji: "🚣", bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700"   },
  kayak:        { emoji: "🛶", bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  escalada:     { emoji: "🧗", bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700"    },
  ciclismo:     { emoji: "🚴", bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700"  },
  montañismo:   { emoji: "🏔️", bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700"  },
  parapente:    { emoji: "🪂", bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700"     },
  ecoturismo:   { emoji: "🌿", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  camping:      { emoji: "🏕️", bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700"  },
  observacion:  { emoji: "🦅", bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  default:      { emoji: "⚡", bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700"     },
};

const FALLBACK_DEPORTES = [
  { nombre: "Trekking" },
  { nombre: "Rafting"  },
  { nombre: "Kayak"    },
  { nombre: "Escalada" },
];

const getDeporteStyle = (nombre) => {
  const key = nombre?.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return DEPORTE_MAP[key] || DEPORTE_MAP.default;
};

function Section2() {
  // ── Estado para deportes destacados ─────────────────────────────────────
  const [deportesDestacados, setDeportesDestacados] = useState([]);
  const [cargandoDeportes, setCargandoDeportes] = useState(true);

  useEffect(() => {
    const fetchDeportesDestacados = async () => {
      try {
        const res = await fetch("/api/reservas/deportes-destacados");
        if (!res.ok) throw new Error("Error al obtener deportes");
        const data = await res.json();
        if (data.hayDatos && data.deportes.length > 0) {
          setDeportesDestacados(data.deportes);
        } else {
          // Fallback: sin reservas en la BD
          setDeportesDestacados(FALLBACK_DEPORTES);
        }
      } catch {
        // Fallback en caso de error de red
        setDeportesDestacados(FALLBACK_DEPORTES);
      } finally {
        setCargandoDeportes(false);
      }
    };
    fetchDeportesDestacados();
  }, []);

  const regions = [
    {
      id: "cbba",
      abbr: "COCHABAMBA",
      name: "BOLIVIA",
      images: [
        {
          src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/e7/ba/ca/caption.jpg?w=900&h=500&s=1",
          alt: "Valle central de Cochabamba con montañas y clima templado",
          title: "Valle Central"
        },
        {
          src: "https://www.opinion.com.bo/asset/thumbnail,992,558,center,center/media/opinion/images/2024/09/12/2024091222302442907.jpg",
          alt: "Cordillera del Tunari en Cochabamba para montañismo",
          title: "Cordillera del Tunari"
        },
        {
          src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          alt: "Ríos y valles de Cochabamba ideales para rafting y aventura",
          title: "Ríos de Aventura"
        }
      ],
      description: "Cochabamba, conocida como la 'Ciudad de la Eterna Primavera', ofrece montañas ideales para escalada y ríos con rápidos perfectos para rafting y kayak extremo. Su clima templado lo convierte en el destino perfecto para deportes de aventura todo el año."
    },
    {
      id: "czs",
      abbr: "SANTA CRUZ",
      name: "BOLIVIA",
      images: [
        {
          src: "https://scontent.fcbb1-1.fna.fbcdn.net/v/t1.6435-9/125836558_3118806368224888_3435235307057799256_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=ib57M00vHRUQ7kNvwGKCYrb&_nc_oc=AdlpUrGVx1gQ3o2tP47zuPukObxrtoCnspMOMjED1iSh1BKDw9alejjwL7tX_3ALGHlqhwihE5Osw4U_0VtjBen-&_nc_zt=23&_nc_ht=scontent.fcbb1-1.fna&_nc_gid=pRLP-ks2d9VWMFHhgqmmRA&oh=00_AfLw7u-MQUl19FTxgVk1Yvm7eQggCd7-UWRMp5TGIEI_og&oe=685B03F5",
          alt: "Paisajes tropicales de Santa Cruz con biodiversidad única",
          title: "Paisajes Tropicales"
        },
        {
          src: "https://scontent.fcbb1-1.fna.fbcdn.net/v/t1.6435-9/126229407_3118806404891551_6262699058642345572_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=w0VAQrEWvFMQ7kNvwFg3YXK&_nc_oc=AdkzqzJxEyI_Hu0o65dz_pgLAcGgAG3tbNebRiu17_S3FcCl8HXczJCaqr5pB4400ZEsBW11rzO9NltID-j9g3YK&_nc_zt=23&_nc_ht=scontent.fcbb1-1.fna&_nc_gid=OC5ym3U1NFEysn7cN7Duog&oh=00_AfJwlThd-AV9taLQ_sBG0-0E12IvvEsmB9k4bj8kiTep3A&oe=685B0588",
          alt: "Parques nacionales de Santa Cruz para ecoturismo extremo",
          title: "Parques Nacionales"
        },
        {
          src: "https://scontent.fcbb1-1.fna.fbcdn.net/v/t1.6435-9/126201612_3118806734891518_2052700142333131228_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=lPMZIrtq4LoQ7kNvwHfj0AH&_nc_oc=AdlkEPxP4JCNh_-1VuD_WPH-zP9S3gszH4iguhhJCnorhu5US8tglk2G2wKV0rh-W32Jf5VgyQLXExyRr2dNKDgu&_nc_zt=23&_nc_ht=scontent.fcbb1-1.fna&_nc_gid=fdnaz1PFxHc2zclgR-0ePQ&oh=00_AfJNeqtgrPUMCf4sB1U04sMu5j-_2r0GsFJkWHSPmRKhVg&oe=685B0A13",
          alt: "Selva amazónica de Santa Cruz con aventuras selváticas",
          title: "Selva Amazónica"
        }
      ],
      description: "Santa Cruz es la puerta de entrada a la Amazonía boliviana, ofreciendo aventuras selváticas únicas, parques nacionales con biodiversidad excepcional y experiencias de ecoturismo extremo."
    },
    {
      id: "lp",
      abbr: "LA PAZ",
      name: "BOLIVIA",
      images: [
        {
          src: "https://scontent.fcbb1-1.fna.fbcdn.net/v/t1.6435-9/89124675_2462509737187891_421002727397523456_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=sgqiOYMmgMIQ7kNvwGs03dx&_nc_oc=AdnBYSC9Y9JkWSFS8yZIftWfrgcuWrE5vltuI9k5y1yMDVgkbSUbL4RVALRcaqRFXuvZoppC9p8M8Te3gBu1VBf0&_nc_zt=23&_nc_ht=scontent.fcbb1-1.fna&_nc_gid=C50C1fH5bnNsPFK0L0WKJg&oh=00_AfJphUEeAmbt_F20sQRhw1MtmszK2lLE2gpeOwvUjocYTQ&oe=685AEF9A",
          alt: "Ciudad de La Paz con montañas nevadas y arquitectura única",
          title: "Ciudad de La Paz"
        },
        {
          src: "https://scontent.fcbb1-1.fna.fbcdn.net/v/t1.6435-9/88307204_2462559737182891_287756014193737728_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=fPlAfrvKFRYQ7kNvwHn7FqH&_nc_oc=Adlu1OIaUDp3qFpmqGqrZX9t_NElpfUwWMQTvJtaWjP1Mml3t0OiPTxGzqTwOoArzDrcxR97mt-ClscXm7WN3sKN&_nc_zt=23&_nc_ht=scontent.fcbb1-1.fna&_nc_gid=crwVGMlAJ3SDJndXFx7ciA&oh=00_AfJnUTkCJK1PegN3r2-DBbtCbLqi5ajM-Z5gAPeSaLKCWw&oe=685AF3D8",
          alt: "Cordillera Real de La Paz para montañismo extremo",
          title: "Cordillera Real"
        },
        {
          src: "https://scontent.fcbb1-2.fna.fbcdn.net/v/t1.6435-9/88958612_2462558017183063_3937825393649647616_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Q8eAXluJMm4Q7kNvwFXayaT&_nc_oc=AdnRzpjXnXhtxRNejahPskv2HsDpmxS0QA7z9RSDlDIsIp8DAgF73jeSz_Jt8ecMfhev9pZsVX1CsKTxX5pdeN9D&_nc_zt=23&_nc_ht=scontent.fcbb1-2.fna&_nc_gid=dUSD6j8g-LpTNQO3R5Owog&oh=00_AfKf2pER3Lxy7YLTENV2HOycUPd8wqnYDHY8A1Ly0ARLKA&oe=685AEE1F",
          alt: "Valle de la Luna y paisajes únicos de La Paz",
          title: "Valle de la Luna"
        }
      ],
      description: "La Paz, la ciudad más alta del mundo, destaca por sus tirolinas sobre valles profundos, senderos de montaña para ciclismo extremo y la famosa Cordillera Real para montañismo de alta altitud."
    }
  ];

  const [selectedRegion, setSelectedRegion] = useState("cbba");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const region = regions.find((r) => r.id === selectedRegion);

  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedImageIndex(0);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
            🏔️ Regiones de Aventura
          </h1>
          <p className="text-gray-600">Explora los destinos más emocionantes de Bolivia</p>
        </div>

        {/* Navegación de Regiones */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRegionChange(r.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  r.id === selectedRegion
                    ? "bg-gradient-to-r from-red-600 to-orange-600 border-red-600 text-white shadow-xl"
                    : "bg-white border-gray-200 text-gray-800 hover:border-red-300 hover:shadow-md"
                }`}
              >
                <div className="text-2xl font-bold mb-1">{r.abbr}</div>
                <div className="text-sm font-semibold opacity-90">{r.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la Región */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          
          {/* Header de Región */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 border-b border-red-700">
            <h2 className="text-2xl font-bold text-white">📍 {region.abbr}</h2>
            <p className="text-white/90 text-sm">{region.name}</p>
          </div>

          {/* Contenido */}
          <div className="p-6">
            
            {/* Galería de Imágenes */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📸 Galería de Imágenes
              </h3>

              {/* Imagen Principal */}
              <div className="mb-6 relative group">
                <img
                  src={region.images[selectedImageIndex]?.src}
                  alt={region.images[selectedImageIndex]?.alt}
                  className="w-full h-[400px] object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {selectedImageIndex + 1} / {region.images.length}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end p-6">
                  <div className="text-white">
                    <h4 className="text-2xl font-bold mb-2">{region.images[selectedImageIndex]?.title}</h4>
                    <p className="text-sm">{region.images[selectedImageIndex]?.alt}</p>
                  </div>
                </div>
              </div>

              {/* Miniaturas */}
              <div className="grid grid-cols-3 gap-4">
                {region.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                      selectedImageIndex === index
                        ? "ring-4 ring-red-500 shadow-xl scale-105"
                        : "hover:shadow-lg hover:scale-102"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-32 object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📝 Descripción</h3>
              <p className="text-gray-700 leading-relaxed">{region.description}</p>
            </div>

            {/* Deportes Destacados — dinámico desde BD */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                ⚡ Deportes Destacados
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {cargandoDeportes
                  ? "Cargando actividades..."
                  : deportesDestacados.some((d) => d.totalReservas)
                  ? "Basado en la demanda real de reservas"
                  : "Actividades recomendadas"}
              </p>

              {cargandoDeportes ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 animate-pulse p-4 rounded-xl h-24"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {deportesDestacados.map((deporte, idx) => {
                    const style = getDeporteStyle(deporte.nombre);
                    return (
                      <div
                        key={deporte._id || idx}
                        className={`${style.bg} p-4 rounded-xl text-center border-2 ${style.border} hover:scale-105 transition-transform duration-200`}
                      >
                        <div className="text-3xl mb-2">{style.emoji}</div>
                        <div className={`font-bold ${style.text}`}>
                          {deporte.nombre}
                        </div>
                        {deporte.totalReservas && (
                          <div className="text-xs text-gray-500 mt-1">
                            {deporte.totalReservas} reserva
                            {deporte.totalReservas !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Datos de la Región</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Altitud:</span>
                    <span className="font-bold text-gray-900">
                      {region.id === "cbba" && "2,558 msnm"}
                      {region.id === "czs" && "416 msnm"}
                      {region.id === "lp" && "3,500 msnm"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Clima:</span>
                    <span className="font-bold text-gray-900">
                      {region.id === "cbba" && "Templado"}
                      {region.id === "czs" && "Tropical"}
                      {region.id === "lp" && "Frío"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Mejor época:</span>
                    <span className="font-bold text-gray-900">
                      {region.id === "cbba" && "Todo el año"}
                      {region.id === "czs" && "Mayo-Oct"}
                      {region.id === "lp" && "Abr-Oct"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-blue-900 mb-4">🎯 Dificultad</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-700">Bajo:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${i < (region.id === "cbba" ? 4 : region.id === "czs" ? 5 : 2) ? "bg-green-500" : "bg-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-700">Medio:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${i < (region.id === "cbba" ? 5 : region.id === "czs" ? 3 : 4) ? "bg-yellow-500" : "bg-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-700">Alto:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${i < (region.id === "cbba" ? 3 : region.id === "czs" ? 2 : 5) ? "bg-red-500" : "bg-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Section2;