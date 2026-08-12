import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on('locationfound', (e) => {
      setPosition(e.latlng);
    });

    map.on('locationerror', () => {
      setPosition({ lat: 39.9334, lng: 32.8597 });
      map.setView([39.9334, 32.8597], 13);
    });
  }, [map, setPosition]);

  return position ? (
    <Marker position={position}>
      <Popup>Konumunuz</Popup>
    </Marker>
  ) : null;
}

function MapEventsHandler({ onCenterChange }) {
  const map = useMapEvents({
    moveend: () => {
      if (onCenterChange) {
        const center = map.getCenter();
        onCenterChange({ lat: center.lat, lng: center.lng });
      }
    }
  });
  return null;
}

export default function MapView({ children, onCenterChange }) {
  const [position, setPosition] = useState(null);

  return (
    <MapContainer
      center={[39.9334, 32.8597]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      <MapEventsHandler onCenterChange={onCenterChange} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
      {children}
    </MapContainer>
  );
}
