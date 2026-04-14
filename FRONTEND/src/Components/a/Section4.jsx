"use client";

import React from 'react';

/* ================= ICONOS ================= */
const Users = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Award = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const Heart = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Mountain = ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
  </svg>
);

function Section4() {
  const team = [
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1601977218317-72e0996ecdfe?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Juan Pérez",
      role: "Líder del equipo",
      specialty: "Montañismo & Escalada",
      experience: "15 años de experiencia",
      description: "Apasionado por el deporte extremo y la aventura en alta montaña",
      gradient: "from-red-500 to-orange-500"
    },
    {
      type: "image",
      src: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      name: "Carlos Ramírez",
      role: "Guía Senior",
      specialty: "Rafting & Kayak",
      experience: "12 años de experiencia",
      description: "Experto en deportes acuáticos y expediciones extremas",
      gradient: "from-orange-500 to-amber-500"
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              Conócenos
            </h1>
          </div>
          <p className="text-gray-600">
            Nuestro equipo de expertos te guiará en cada aventura
          </p>
        </div>

        {/* Grid de Team Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {team.map((member, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden group hover:shadow-2xl transition-all duration-300"
            >
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r ${member.gradient} p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <img
                    src={member.src}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">{member.name}</h3>
                    <p className="text-white/90 font-semibold">{member.role}</p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Especialidad */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain className="text-red-600" size={20} />
                    <span className="text-sm font-semibold text-gray-600 uppercase">Especialidad</span>
                  </div>
                  <p className="text-gray-900 font-bold">{member.specialty}</p>
                </div>

                {/* Experiencia */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-orange-600" size={20} />
                    <span className="text-sm font-semibold text-gray-600 uppercase">Experiencia</span>
                  </div>
                  <p className="text-gray-900 font-bold">{member.experience}</p>
                </div>

                {/* Descripción */}
                <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-2">
                    <Heart className="text-red-600 flex-shrink-0 mt-1" size={18} />
                    <p className="text-gray-700 leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "Nuestros Valores" fue trasladado al footer global */}

      </div>
    </section>
  );
}

export default Section4;