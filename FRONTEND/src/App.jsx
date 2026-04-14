import React from "react";
import { BrowserRouter } from "react-router-dom"; // Cambiado de HashRouter
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./router/AppRouter";
import Navbar from "./Components/Navbar";
import ToastContainer from "./Components/Toast/ToastContainer";

function App() {
  return (
    
    <AuthProvider>
      <BrowserRouter>
        {" "}
        {/* Cambiado de HashRouter */}
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <AppRouter />
          </main>
          {/* ══════════════════ FOOTER ══════════════════ */}
          <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white mt-auto">

            {/* ── Franja decorativa superior ── */}
            <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

            <div className="max-w-7xl mx-auto px-6 py-12">

              {/* ── Grid principal ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

                {/* Columna 1 – Identidad */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-black">DE</span>
                    </div>
                    <span className="text-xl font-black tracking-wide text-white">
                      DEPORTE EXTREMO
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Operadora especializada en deportes de aventura y turismo extremo en Bolivia.
                    Vive experiencias únicas con total seguridad.
                  </p>
                  {/* Teléfono */}
                  <a
                    href="tel:+59162616697"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    62616697
                  </a>
                </div>

                {/* Columna 2 – Nuestros Valores */}
                <div>
                  <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                    <span className="text-orange-400">★</span> Nuestros Valores
                  </h3>
                  <div className="space-y-4">
                    {/* Seguridad */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Seguridad</p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          Tu seguridad es nuestra prioridad en cada aventura
                        </p>
                      </div>
                    </div>
                    {/* Experiencia */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="7" strokeWidth="2" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Experiencia</p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          Años de trayectoria en deportes extremos bolivianos
                        </p>
                      </div>
                    </div>
                    {/* Pasión */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Pasión</p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          Amamos lo que hacemos y se nota en cada expedición
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 3 – Ubicación */}
                <div>
                  <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                    <span className="text-orange-400">📍</span> Encuéntranos
                  </h3>
                  <a
                    href="https://www.google.com/maps/search/Torres+Sofer+Cochabamba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group mb-4"
                  >
                    <div className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-orange-500 rounded-xl p-4 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </div>
                        <span className="text-white font-bold text-sm group-hover:text-orange-400 transition-colors">
                          Torres Sofer — Último Piso
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs pl-11">
                        Cochabamba, Bolivia
                      </p>
                      <p className="text-orange-400 text-xs pl-11 mt-1 group-hover:underline">
                        Ver en Google Maps →
                      </p>
                    </div>
                  </a>

                  {/* WhatsApp directo */}
                  <a
                    href={`https://wa.me/59162616697?text=${encodeURIComponent("Hola, ¿se encuentra en la oficina? Estoy interesado en realizar una reserva")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-700/30 w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    Escribir por WhatsApp
                  </a>
                </div>

              </div>

              {/* ── Separador ── */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} <span className="text-gray-400 font-semibold">Deporte Extremo Bolivia</span>. Todos los derechos reservados.
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Servicio disponible todo el año
                  </div>
                </div>
              </div>

            </div>
          </footer>
          {/* ═══════════════════════════════════════════ */}
        </div>
      </BrowserRouter>{" "}
      {/* Cambiado de HashRouter */}
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
