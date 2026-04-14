"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import axios from "axios";

const API_URL = "/api";

function OlvidasteContrasena() {
  const [email, setEmail] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isReset, setIsReset] = useState(false);
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si hay un token en la URL al cargar el componente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      setToken(tokenParam);
      setIsReset(true);
    }
  }, [location]);

  const handleSolicitarRecuperacion = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/recuperar`, { email });

      setMessage(
        response.data.msg ||
          "Se ha enviado un enlace de recuperación a tu correo"
      );
    } catch (err) {
      setError(err.response?.data?.msg || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!nuevaPassword) {
      setError("Por favor, ingresa una nueva contraseña.");
      return;
    }

    if (nuevaPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/auth/restablecer/${token}`,
        {
          nuevaPassword,
        }
      );

      setMessage(response.data.msg || "Contraseña restablecida correctamente");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleVolverLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <section className="p-8 bg-gradient-to-b from-white to-gray-50">
          <button
            onClick={handleVolverLogin}
            className="flex items-center text-red-700 hover:text-red-800 mb-6 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Volver al inicio de sesión</span>
          </button>

          <h2 className="text-3xl font-bold text-red-700 text-center mb-8 tracking-tight">
            {isReset ? "Restablecer contraseña" : "Recuperar contraseña"}
          </h2>

          {!isReset ? (
            // Formulario para solicitar recuperación
            <form onSubmit={handleSolicitarRecuperacion} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-red-700 font-semibold"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border-2 border-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-4 rounded-xl hover:from-red-800 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "ENVIANDO..." : "ENVIAR ENLACE DE RECUPERACIÓN"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Te enviaremos un enlace a tu correo electrónico para restablecer
                tu contraseña.
              </p>
            </form>
          ) : (
            // Formulario para restablecer contraseña
            <form onSubmit={handleRestablecerPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="nuevaPassword"
                  className="block mb-2 text-red-700 font-semibold"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="nuevaPassword"
                    name="nuevaPassword"
                    required
                    placeholder="******"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full p-4 border-2 border-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-700 focus:outline-none hover:text-red-800 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-red-700 font-semibold"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 border-2 border-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-red-700 to-red-600 text-white font-bold py-4 rounded-xl hover:from-red-800 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "RESTABLECIENDO..." : "RESTABLECER CONTRASEÑA"}
              </button>
            </form>
          )}

          {message && (
            <div className="mt-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default OlvidasteContrasena;
