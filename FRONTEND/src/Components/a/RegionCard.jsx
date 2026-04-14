import React from 'react';

function RegionCard({ region, active, onClick }) {
  return (
    <div
      onClick={() => onClick(region.id)}
      className={`cursor-pointer p-4 border rounded-lg transition-colors duration-300 ${
        active ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
      } hover:bg-red-500 hover:text-white`}
      aria-label={`Seleccionar región ${region.abbr}`}
    >
      <h4 className="text-xl font-bold">{region.abbr}</h4>
      <p className="mt-2">{region.description}</p>
    </div>
  );
}

export default RegionCard;
