'use client';

import { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { school } from '@/lib/content';

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function SchoolMapClient() {
  const position = school.coordinates;
  const marker = useMemo(() => L.divIcon({
    className: 'school-marker-anchor',
    html: '<span class="school-marker"><img src="/images/school-crest.jpeg" alt="" /></span>',
    iconSize: [54, 66],
    iconAnchor: [27, 64],
    popupAnchor: [0, -58],
  }), []);

  return <div className="school-map-shell">
    <div className="school-map-intro">
      <span className="school-map-icon"><MapPin size={22} aria-hidden="true" /></span>
      <div>
        <h2>Find our school.</h2>
        <p>{school.physicalAddress}</p>
        <a href={school.directionsUrl} target="_blank" rel="noopener noreferrer" className="button button-primary">Get directions <ArrowUpRight size={17} /></a>
      </div>
    </div>
    <MapContainer
      center={position}
      zoom={15}
      minZoom={4}
      maxZoom={19}
      scrollWheelZoom
      dragging
      keyboard
      className="school-map"
      aria-label="Interactive map showing Presbyterian High School in Mhondoro"
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        maxZoom={19}
      />
      <Marker position={position} icon={marker} title="Presbyterian High School">
        <Popup className="school-map-popup">
          <strong>{school.name}</strong>
          <span>{school.physicalAddress}</span>
          <span>{school.address}</span>
          <a href={school.directionsUrl} target="_blank" rel="noopener noreferrer">Get directions <ArrowUpRight size={14} /></a>
        </Popup>
      </Marker>
    </MapContainer>
  </div>;
}
