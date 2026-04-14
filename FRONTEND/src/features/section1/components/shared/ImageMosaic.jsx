import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Video, Package } from './icons';
import { MAX_MOSAIC_IMAGES } from '../../utils/constants';

const ImageMosaic = ({ images, maxImages = MAX_MOSAIC_IMAGES, onImageClick, hasVideo360 }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayedImages = images.slice(0, maxImages);
  const totalImages = images.length;
  const hasMore = totalImages > maxImages;

  const openLightbox = (index) => {
    setSelectedImage(index);
    setIsLightboxOpen(true);
  };

  const navigateImage = (direction) => {
    setSelectedImage((prev) => (prev + direction + totalImages) % totalImages);
  };

  // Botón de equipamiento: con foto si existe, sin foto si no
  const EquipoButton = ({ image }) => {
    const badge = hasMore ? `+${totalImages - maxImages} más` : null;
    if (image) {
      return (
        <ImageTile
          image={image}
          title="Equipo Necesario"
          subtitle="Ver equipamiento"
          icon={<Package size={20} />}
          badge={badge}
          onClick={() => onImageClick('equipo')}
        />
      );
    }
    return (
      <button
        onClick={() => onImageClick('equipo')}
        className="relative h-48 rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 transition-all duration-300 group flex flex-col items-center justify-center gap-3 w-full"
      >
        <div className="w-12 h-12 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
          <Package size={24} className="text-purple-600" />
        </div>
        <div className="text-center">
          <p className="font-bold text-purple-700 text-base">Equipo Necesario</p>
          <p className="text-xs text-purple-400 mt-0.5">Ver equipamiento 3D</p>
        </div>
        {badge && (
          <div className="absolute top-3 right-3 bg-white/90 text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
            {badge}
          </div>
        )}
      </button>
    );
  };

  const renderSingleImage = () => (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl cursor-pointer group h-56"
        onClick={() => hasVideo360 ? onImageClick('video') : openLightbox(0)}
      >
        <img
          src={displayedImages[0]}
          alt="Imagen principal"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {hasVideo360 && renderVideoOverlay(true)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ImageTile
          image={displayedImages[0]}
          title="Ver deporte"
          subtitle="Click para más info"
          onClick={() => onImageClick('deporte')}
        />
        <EquipoButton image={null} />
      </div>
    </div>
  );

  const renderDoubleImage = () => (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl cursor-pointer group h-56"
        onClick={() => hasVideo360 ? onImageClick('video') : openLightbox(0)}
      >
        <img
          src={displayedImages[0]}
          alt="Imagen principal"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {hasVideo360 && renderVideoOverlay(true)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ImageTile
          image={displayedImages[1]}
          title="Ver deporte"
          subtitle="Click para más info"
          onClick={() => onImageClick('deporte')}
        />
        <EquipoButton image={null} />
      </div>
    </div>
  );

  const renderTripleImage = () => (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-2xl cursor-pointer group h-56"
        onClick={() => hasVideo360 ? onImageClick('video') : openLightbox(0)}
      >
        <img
          src={displayedImages[0]}
          alt="Imagen principal"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {hasVideo360 && renderVideoOverlay(true)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ImageTile
          image={displayedImages[1]}
          title="Nombre del Deporte"
          subtitle="Click para más info"
          onClick={() => onImageClick('deporte')}
        />
        <EquipoButton image={displayedImages[2]} />
      </div>
    </div>
  );

  const renderVideoOverlay = (isLarge) => (
    <>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`${isLarge ? 'w-20 h-20' : 'w-16 h-16'} bg-white/90 rounded-full flex items-center justify-center`}>
            <Video className="text-red-600" size={isLarge ? 40 : 32} />
          </div>
        </div>
      </div>
      {isLarge && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
          <Video size={16} />
          360° Video
        </div>
      )}
    </>
  );

  const ImageTile = ({ image, title, subtitle, icon, badge, onClick }) => (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group h-48"
      onClick={onClick}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 text-white">
        <p className="font-bold text-lg mb-1 flex items-center gap-2">
          {icon}
          {title}
        </p>
        <p className="text-xs opacity-90">{subtitle}</p>
      </div>
      {badge && (
        <div className="absolute top-3 right-3 bg-white/90 text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
          {badge}
        </div>
      )}
    </div>
  );

  const renderLightbox = () => (
    <div
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
      onClick={() => setIsLightboxOpen(false)}
    >
      <button
        onClick={() => setIsLightboxOpen(false)}
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-3 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-3 transition-all"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-3 transition-all"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
      <div className="max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[selectedImage]}
          alt={`Imagen ${selectedImage + 1}`}
          className="w-full h-full object-contain rounded-2xl"
        />
        <div className="text-center mt-4">
          <p className="text-white font-semibold">
            {selectedImage + 1} / {totalImages}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {displayedImages.length === 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="h-48 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Sin imágenes
          </div>
          <EquipoButton image={null} />
        </div>
      )}
      {displayedImages.length === 1 && renderSingleImage()}
      {displayedImages.length === 2 && renderDoubleImage()}
      {displayedImages.length >= 3 && renderTripleImage()}
      {isLightboxOpen && renderLightbox()}
    </>
  );
};

export default ImageMosaic;