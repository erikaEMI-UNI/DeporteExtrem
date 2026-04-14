import { Video } from '../shared/icons';
import { 
  ModalContainer, 
  ModalHeader,
  VideoPlaceholder,
  TipMessage,
  ReservaCTA
} from '../shared/ModalComponents';
import { getYouTubeEmbedUrl } from '../../utils/formatters';

const Video360Modal = ({ isOpen, onClose, videoUrl, activityName, onReservar }) => {
  if (!isOpen) return null;

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <ModalContainer onClose={onClose} maxWidth="max-w-6xl">
      <ModalHeader 
        title="Video 360° - Experiencia Inmersiva"
        subtitle={activityName}
        icon={<Video size={24} />}
        gradient="from-red-600 to-orange-600"
        onClose={onClose}
      />
      
      <div className="p-6">
        {embedUrl ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title="Video 360°"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <VideoPlaceholder />
        )}
        
        <TipMessage message="Arrastra con el mouse dentro del video para explorar la vista 360°. Activa pantalla completa para una mejor experiencia." />
        
        <ReservaCTA onReservar={onReservar} />
      </div>
    </ModalContainer>
  );
};

export default Video360Modal;