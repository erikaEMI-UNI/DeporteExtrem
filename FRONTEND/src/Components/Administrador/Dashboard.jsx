import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const data = {
    labels: ['Usuarios Nuevos', 'Reservas', 'Actividades Populares', 'Feedback Positivo'],
    datasets: [
      {
        label: 'Tendencias de uso',
        data: [300, 500, 200],
        backgroundColor: [
          'rgba(167, 53, 53, 0.84)', // red
          'rgb(96, 3, 3)',  // orange
          'rgb(250, 4, 4)', // red
        ],
        borderColor: [
          'rgba(167, 53, 53, 0.84)', // red
          'rgb(96, 3, 3)',  // orange
          'rgb(250, 4, 4)', // red
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-red-700">Panel de Control</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-red-700">Tendencias de Uso</h3>
        <div className="w-full max-w-md mx-auto">
          <Doughnut data={data} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-md font-medium text-red-700 mb-2">Usuarios Activos</h4>
          <p className="text-3xl font-bold text-red-600">127</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-md font-medium text-red-700 mb-2">Reservas Hoy</h4>
          <p className="text-3xl font-bold text-red-500">42</p>
        </div>
      </div>
    </section>
  );
}
