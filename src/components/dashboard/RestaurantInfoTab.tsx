'use client';

import React from 'react';

type Props = {
  restaurant?: any;
};

export const RestaurantInfoTab: React.FC<Props> = ({ restaurant }) => {
  if (!restaurant) return <div>Informations indisponibles.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Restaurant</h2>
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="font-medium text-lg">{restaurant.name}</div>
        <div className="text-sm text-stone-500">{restaurant.description || '—'}</div>
      </div>
    </div>
  );
};
