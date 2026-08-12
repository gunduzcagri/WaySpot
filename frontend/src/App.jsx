import { useState } from 'react';
import MapView from './components/MapView';
import RoutePlanner from './components/RoutePlanner';
import DiscoverMarkers from './components/DiscoverMarkers';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [mapCenter, setMapCenter] = useState({ lat: 39.9334, lng: 32.8597 });

  return (
    <>
      <ThemeToggle />
      <MapView onCenterChange={setMapCenter}>
        <RoutePlanner />
        <DiscoverMarkers center={mapCenter} />
      </MapView>
    </>
  );
}

export default App;
