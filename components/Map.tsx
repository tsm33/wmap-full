'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function InteractiveMap({ places = [] }: { places?: any[] }) {
  return (
    <MapContainer 
      center={[55.7558, 37.6173]} 
      zoom={12} 
      style={{ height: '100%', width: '100%', borderRadius: '24px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {places.map((place: any) => (
        <Marker 
          key={place.id} 
          position={[Number(place.latitude), Number(place.longitude)]}
        >
          <Popup>{place.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}