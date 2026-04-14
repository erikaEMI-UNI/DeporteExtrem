import { useEffect } from 'react';

const HuginnMonitor = () => {
  useEffect(() => {
    const reportToHuginn = async () => {
      try {
        await fetch('http://monitoreo.local/huginn/frontend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            secret: 'tu_secreto_compartido' // El mismo que en el backend
          })
        });
      } catch (error) {
        console.error('❌ Huginn report failed:', error);
      }
    };

    reportToHuginn();
  }, []);

  return null;
};

export default HuginnMonitor;
///esto agrege recien 