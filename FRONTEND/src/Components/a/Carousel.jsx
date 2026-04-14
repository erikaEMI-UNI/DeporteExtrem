"use client";

import React, { useEffect, useState } from 'react';

/* ================= ICONOS ================= */
const ChevronLeft = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function Carousel({ items }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const length = items.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length);
    }, 5000); // 5 segundos por slide
    return () => clearInterval(interval);
  }, [length]);

  function prevSlide() {
    setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
  }

  function nextSlide() {
    setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto select-none">
      {/* Container de la imagen */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gray-100 group">
        {items.map((item, index) => (
          <div
            key={index}
            className={`transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 relative' 
                : 'opacity-0 absolute top-0 left-0 w-full pointer-events-none'
            }`}
            aria-hidden={index !== currentIndex}
          >
            <img
              src={item.src}
              alt={item.alt || item.caption}
              className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              loading="lazy"
            />
            
            {/* Overlay gradiente en hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}

        {/* Botones de navegación */}
        <button
          onClick={prevSlide}
          aria-label="Imagen anterior"
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 hover:bg-white text-red-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Imagen siguiente"
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 hover:bg-white text-red-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
        >
          <ChevronRight size={24} />
        </button>

        {/* Indicadores de posición (dots) */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex 
                  ? 'w-8 h-3 bg-white shadow-lg' 
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Ir a la imagen ${idx + 1}`}
            />
          ))}
        </div>

        {/* Contador de imágenes */}
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
          {currentIndex + 1} / {length}
        </div>
      </div>

      {/* Caption y descripción FUERA de la imagen */}
      <div className="mt-6 text-center space-y-3">
        <h3 className="text-2xl font-bold text-gray-900">
          {items[currentIndex].caption}
        </h3>
        {items[currentIndex].description && (
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            {items[currentIndex].description}
          </p>
        )}
      </div>

      {/* Barra de progreso animada */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default Carousel;