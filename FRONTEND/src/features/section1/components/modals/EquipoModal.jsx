import { useEffect, useRef, useState } from 'react';
import { Package } from '../shared/icons';
import { ModalContainer, ModalHeader, ReservaCTA } from '../shared/ModalComponents';

const EquipoModal = ({ isOpen, onClose, onReservar, modelos3d = [], categorias = [] }) => {
  if (!isOpen) return null;

  const [modeloActivo, setModeloActivo] = useState(0);

  // Combina modelos propios de la actividad + modelos de sus categorías (sin duplicar por url)
  const urlsVistas = new Set();
  const todosModelos = [];
  for (const m of modelos3d) {
    if (!urlsVistas.has(m.url)) { urlsVistas.add(m.url); todosModelos.push(m); }
  }
  for (const cat of categorias) {
    for (const m of (cat.modelos3d || [])) {
      if (!urlsVistas.has(m.url)) {
        urlsVistas.add(m.url);
        todosModelos.push({ ...m, nombre: m.nombre || cat.nombre });
      }
    }
  }

  const equipamiento = [
    { nombre: "Casco de Seguridad", imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", incluido: true, descripcion: "Casco homologado para deportes extremos" },
    { nombre: "Arnés Profesional", imagen: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400", incluido: true, descripcion: "Arnés de seguridad certificado" },
    { nombre: "Cuerdas y Mosquetones", imagen: "https://images.unsplash.com/photo-1589385373846-c29d4cc77059?w=400", incluido: true, descripcion: "Material de escalada profesional" },
    { nombre: "Ropa Deportiva", imagen: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400", incluido: false, descripcion: "Vestimenta cómoda para actividad física" },
    { nombre: "Calzado Apropiado", imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", incluido: false, descripcion: "Zapatillas de trekking o deportivas" },
    { nombre: "Protector Solar", imagen: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400", incluido: false, descripcion: "Factor 50+ recomendado" }
  ];

  const urlActiva = todosModelos[modeloActivo]?.url || null;

  return (
    <ModalContainer onClose={onClose} maxWidth="max-w-7xl">
      <ModalHeader
        title="Equipo Necesario"
        icon={<Package size={24} />}
        gradient="from-purple-600 to-pink-600"
        onClose={onClose}
      />

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        <p className="text-gray-600 mb-6">
          Todo el equipamiento de seguridad está incluido. Solo necesitas traer tu ropa deportiva y ganas de aventura.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            {/* Selector de modelos */}
            {todosModelos.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {todosModelos.map((m, i) => (
                  <button
                    key={m._id || i}
                    onClick={() => setModeloActivo(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${i === modeloActivo
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                      }`}
                  >
                    {m.nombre || `Modelo ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            <Modelo3DViewer url={urlActiva} key={urlActiva} />
          </div>

          <EquipamientoList items={equipamiento} />
        </div>

        <ReservaCTA onReservar={onReservar} />
      </div>
    </ModalContainer>
  );
};

/* ─── Visor Three.js con texturas y ambiente ────────────────────────────────── */
const Modelo3DViewer = ({ url }) => {
  const mountRef = useRef(null);
  const cleanupRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!url || !mountRef.current) return;

    let cancelled = false;
    setStatus('loading');
    setErrorMsg('');

    const container = mountRef.current;

    const init = async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');

        if (cancelled) return;

        const w = container.clientWidth;
        const h = container.clientHeight;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        // Corrección de color para texturas PBR (clave para que se vean las texturas GLB)
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f0ff);

        // Environment map (indispensable para PBR/metallic/roughness de GLB)
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;
        pmrem.dispose();

        // Camera
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.001, 2000);
        camera.position.set(0, 1.5, 3);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 0.1;
        controls.maxDistance = 500;

        // Cargar modelo según extensión
        const ext = url.split('.').pop().toLowerCase();
        let loader;

        if (ext === 'glb' || ext === 'gltf') {
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
          loader = new GLTFLoader();
        } else if (ext === 'fbx') {
          const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
          loader = new FBXLoader();
        } else {
          if (!cancelled) { setStatus('error'); setErrorMsg('Formato no soportado (.glb o .fbx)'); }
          return;
        }

        if (cancelled) return;

        loader.load(
          `/${url}`,
          (result) => {
            if (cancelled) return;

            const model = (ext === 'glb' || ext === 'gltf') ? result.scene : result;

            // Asegurar colorSpace correcto en todas las texturas del modelo
            model.traverse((child) => {
              if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                  if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                  if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                  mat.needsUpdate = true;
                });
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // Centrar y escalar
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / (maxDim || 1);
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));

            scene.add(model);

            camera.position.set(0, size.y * scale * 0.5, maxDim * scale * 2.2);
            controls.target.set(0, 0, 0);
            controls.update();

            setStatus('ready');
          },
          undefined,
          (err) => {
            if (cancelled) return;
            console.error('Error cargando modelo 3D:', err);
            setStatus('error');
            setErrorMsg('No se pudo cargar el modelo');
          }
        );

        // Loop de animación
        let animId;
        const animate = () => {
          animId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const onResize = () => {
          const nw = container.clientWidth;
          const nh = container.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener('resize', onResize);

        // Cleanup
        cleanupRef.current = () => {
          cancelled = true;
          cancelAnimationFrame(animId);
          window.removeEventListener('resize', onResize);
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        };

      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg('Error al inicializar el visor');
          console.error(err);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [url]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Vista 3D del Equipamiento
      </h4>

      <div
        ref={mountRef}
        className="w-full h-[420px] bg-white rounded-xl shadow-inner relative overflow-hidden"
      >
        {!url && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <svg className="w-16 h-16 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p className="font-semibold">Sin modelo 3D disponible</p>
            <p className="text-sm mt-1 text-gray-400">El administrador aún no ha subido modelos</p>
          </div>
        )}

        {url && status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 pointer-events-none">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-purple-700 font-semibold text-sm">Cargando modelo 3D…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 pointer-events-none">
            <svg className="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <p className="font-semibold text-sm">{errorMsg}</p>
          </div>
        )}
      </div>

      {url && status === 'ready' && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Arrastra para rotar · Scroll para zoom · Clic derecho para desplazar
        </p>
      )}
    </div>
  );
};

/* ─── Lista de equipamiento ───────────────────────────────────────────────── */
const EquipamientoList = ({ items }) => (
  <div className="space-y-4">
    {items.map((item, index) => (
      <EquipamientoItem key={index} {...item} />
    ))}
  </div>
);

const EquipamientoItem = ({ nombre, imagen, incluido, descripcion }) => (
  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex">
    <div className="relative w-32 h-32 flex-shrink-0">
      <img src={imagen} alt={nombre} className="w-full h-full object-cover" />
      <div className={`absolute top-2 right-2 ${incluido ? 'bg-green-600' : 'bg-amber-600'} text-white px-2 py-1 rounded-full text-xs font-bold`}>
        {incluido ? '✓ Incluido' : 'Traer'}
      </div>
    </div>
    <div className="p-4 flex-1">
      <h4 className="font-bold text-gray-900 mb-1 text-lg">{nombre}</h4>
      <p className="text-sm text-gray-600">{descripcion}</p>
    </div>
  </div>
);

export default EquipoModal;
