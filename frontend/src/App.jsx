import { useState } from 'react';
import MapView from './components/MapView';
import RoutePlanner from './components/RoutePlanner';
import DiscoverMarkers from './components/DiscoverMarkers';

function App() {
  const [mapCenter, setMapCenter] = useState({ lat: 39.9334, lng: 32.8597 });

  return (
    <MapView onCenterChange={setMapCenter}>
      <RoutePlanner />
      <DiscoverMarkers center={mapCenter} />
    </MapView>
  );
}

export default App;
