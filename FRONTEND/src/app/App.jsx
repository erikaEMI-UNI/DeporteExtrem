import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext.jsx";
import AppRouter from "@/app/AppRouter.jsx";
import Navbar from "@/components/layout/Navbar.jsx";
import "@/styles/App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <AppRouter />
          </main>
          <footer className="bg-slate-800 text-white text-center p-4">
            <p>
              &copy; {new Date().getFullYear()} Deportes Extremos. Todos los
              derechos reservados.
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

