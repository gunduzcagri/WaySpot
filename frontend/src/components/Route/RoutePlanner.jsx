import React, { useState } from 'react';
import { Search, Map as MapIcon, Route } from 'lucide-react';
import { routeService } from '../../services/routeService';

const RoutePlanner = ({ onRouteCreated }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock coordinates since we don't have Google Maps geocoding yet
      const routeData = {
        name: `${start} - ${end} Rotası`,
        startLocation: start,
        endLocation: end,
        startLat: 39.92077,
        startLng: 32.85411,
        endLat: 41.0082,
        endLng: 28.9784,
        totalDistanceKm: 450,
        estimatedDurationMinutes: 300
      };
      
      const createdRoute = await routeService.planRoute(routeData);
      if (onRouteCreated) {
        onRouteCreated(createdRoute);
      }
    } catch (error) {
      console.error('Route creation failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Route className="w-6 h-6 mr-2 text-blue-600" />
        Akıllı Rota Planlayıcı
      </h2>
      
      <form onSubmit={handlePlanRoute} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Noktası</label>
          <div className="relative">
            <input 
              type="text" 
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="Mevcut Konumum veya Adres" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varış Noktası</label>
          <div className="relative">
            <input 
              type="text" 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              placeholder="Nereye gitmek istersiniz?" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <h4 className="font-semibold text-blue-900 mb-2">Yol Üzerinde Görmek İstediklerim:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center"><input type="checkbox" className="mr-2" defaultChecked /> Restoranlar</label>
            <label className="flex items-center"><input type="checkbox" className="mr-2" defaultChecked /> Kafeler</label>
            <label className="flex items-center"><input type="checkbox" className="mr-2" defaultChecked /> Tarihi Yerler</label>
            <label className="flex items-center"><input type="checkbox" className="mr-2" /> Manzaralar</label>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm text-blue-900 font-medium mb-1">Max Sapma Mesafesi</label>
            <select className="w-full border-blue-200 rounded p-2 text-sm bg-white">
              <option value="2">Ana yoldan en fazla 2 km uzaklıkta</option>
              <option value="5">Ana yoldan en fazla 5 km uzaklıkta</option>
              <option value="10">Ana yoldan en fazla 10 km uzaklıkta</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 flex items-center justify-center"
        >
          {loading ? 'Planlanıyor...' : (
            <>
              <MapIcon className="w-5 h-5 mr-2" /> Rotayı Oluştur
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoutePlanner;
