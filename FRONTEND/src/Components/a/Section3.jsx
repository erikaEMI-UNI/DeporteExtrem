"use client"

import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import Carousel from "./Carousel"

// Número empresarial WhatsApp y mensaje predefinido
const WA_NUMBER = "591062616697";
const WA_MESSAGE = encodeURIComponent(
  "Hola, ¿se encuentra en la oficina? Estoy interesado en realizar una reserva"
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

function Section3() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleReservar = () => {
    if (isAuthenticated) {
      navigate("/reservas");
    } else {
      navigate("/login");
    }
  };
  const experiences = [
    {
      type: "image",
      src: "https://i0.wp.com/elcalderoviajero.com/wp-content/uploads/2018/04/bolivia-cochabamba-incachaca-13.jpg?fit=750%2C563&ssl=1",
      alt: "Aventura extrema en paisajes bolivianos",
      caption: "Expedición en territorio boliviano",
      description: "Explora los paisajes más remotos y espectaculares de Bolivia",
    },
    {
      type: "image",
      src: "https://blackbeartravel.mx/contenido/uploads/2023/08/bolivia-montanismo-ascenso-huayna-potosi-BLACK-BEAR-TRAVEL-23.jpg",
      alt: "Trekking y aventura en montañas bolivianas",
      caption: "Trekking en alta montaña",
      description: "Conquista las cumbres más desafiantes con vistas panorámicas únicas",
    },
    {
      type: "image",
      src: "https://boliviamia.net/Images/Attractionphotos/rurrenabaque-02.jpg",
      alt: "Deportes extremos en Bolivia",
      caption: "Adrenalina en estado puro",
      description: "Vive experiencias extremas en los escenarios más impresionantes",
    },
    {
      type: "image",
      src: "https://www.soybolivia.bo/storage/2015/10/TUR-AVENTURA-7.jpg",
      alt: "Aventura y naturaleza en Bolivia",
      caption: "Conexión con la naturaleza",
      description: "Sumérgete en la belleza natural más pura de los Andes bolivianos",
    },
    {
      type: "image",
      src: "https://scontent.fcbb2-2.fna.fbcdn.net/v/t1.6435-9/96588858_121923552838075_7301765473480212480_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=13d280&_nc_ohc=J5iMw0t2wfUQ7kNvwEoqrZt&_nc_oc=Adq5QVsaMGU7oWH1qezqmo_A_zVEWFEoQZxGf1lmsb441zoY-sPPbzOYqtZGhnO2bUFXH1eBzKM8784SIZ4iC6Pd&_nc_zt=23&_nc_ht=scontent.fcbb2-2.fna&_nc_gid=KZU8oHSgl982ARGRoqZg2w&_nc_ss=7a3a8&oh=00_Af2hcT8deS3THZFDk25La85kqWh3-5OdSPdYKPNx_IjytA&oe=69F41CF4",
      alt: "Expedición en territorio boliviano",
      caption: "Expedición de alta montaña",
      description: "Alcanza nuevas alturas en las montañas más desafiantes de Bolivia",
    },
    {
      type: "image",
      src: "https://manasluadventures.com/wp-content/uploads/2026/02/trekking_grandes_cumbres_de_bolivia_3ee98e7965.png",
      alt: "Aventura extrema en paisajes bolivianos",
      caption: "Aventura sin límites",
      description: "Experimenta la libertad total en los paisajes más salvajes de Bolivia",
    },
  ]

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
            🎬 Experiencias Extremas
          </h1>
          <p className="text-gray-600">
            Vive la adrenalina al máximo con nuestras experiencias de deportes extremos
          </p>
        </div>

        {/* Carousel Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden mb-6 p-6">
          <Carousel items={experiences} />
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-3">
                ¿Listo para la Aventura?
              </h2>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Únete a miles de aventureros que han vivido experiencias únicas en Bolivia.
                ¡Tu próxima aventura te está esperando!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Botón con lógica condicional de autenticación */}
                <button
                  onClick={handleReservar}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🚀 Reservar Experiencia
                </button>

                {/* Botón de contacto directo vía WhatsApp */}
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-red-600 transition-all duration-300"
                >
                  📞 Contactar Ahora
                </a>
              </div>
            </div>
          </div>

          {/* Stats adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50">
            <div className="text-center p-6 bg-white rounded-xl shadow-md border border-red-100">
              <div className="text-4xl font-black text-red-600 mb-2">500+</div>
              <p className="text-gray-600 font-semibold">Aventureros felices</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md border border-orange-100">
              <div className="text-4xl font-black text-orange-600 mb-2">50+</div>
              <p className="text-gray-600 font-semibold">Rutas disponibles</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md border border-amber-100">
              <div className="text-4xl font-black text-amber-600 mb-2">4.9★</div>
              <p className="text-gray-600 font-semibold">Calificación promedio</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Section3