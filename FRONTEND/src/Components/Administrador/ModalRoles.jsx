import { useState } from "react";

export default function ModalRoles({ isOpen, onClose, onSubmit }) {
  const [usuario, setUsuario] = useState("");
  const [rol, setRol] = useState("");
  const [permisos, setPermisos] = useState([]);

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setPermisos((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ usuario, rol, permisos });
    setUsuario("");
    setRol("");
    setPermisos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="modalRoles"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalRolesTitle"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40"
      onClick={(e) => e.target.id === "modalRoles" && onClose()}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h3 id="modalRolesTitle" className="text-xl font-semibold text-gray-900 mb-4">
          Asignar Roles y Permisos
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="usuarioSelect" className="block text-gray-700 font-medium mb-1">
              Usuario
            </label>
            <select
              id="usuarioSelect"
              name="usuario"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            >
              <option value="">Seleccione un usuario</option>
              <option value="1">Ana Martínez</option>
              <option value="2">Carlos Gómez</option>
              <option value="3">Lucía Fernández</option>
              <option value="4">Javier Ruiz</option>
              <option value="5">María López</option>
            </select>
          </div>
          <div>
            <label htmlFor="rolSelect" className="block text-gray-700 font-medium mb-1">
              Rol
            </label>
            <select
              id="rolSelect"
              name="rol"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="">Seleccione un rol</option>
              <option value="administrador">Administrador</option>
              <option value="operador">Operador</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Permisos</label>
            <div className="flex flex-col space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {['crear', 'editar', 'eliminar', 'exportar', 'ver_reportes'].map((permiso) => (
                <label key={permiso} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600"
                    name="permisos"
                    value={permiso}
                    checked={permisos.includes(permiso)}
                    onChange={handleCheckboxChange}
                  />
                  <span className="ml-2 capitalize">{permiso.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition-colors duration-200"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
