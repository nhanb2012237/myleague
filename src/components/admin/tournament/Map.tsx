import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CiLocationOn } from 'react-icons/ci';
import { renderToStaticMarkup } from 'react-dom/server';

// Chuyển đổi biểu tượng thành URL hình ảnh
const iconMarkup = renderToStaticMarkup(<CiLocationOn size={38} color="red" />);
const iconUrl = `data:image/svg+xml;base64,${btoa(iconMarkup)}`;

const icon = L.icon({
  iconUrl,
  iconSize: [38, 38],
});

// Đặt vị trí ban đầu cố định
const initialPosition: [number, number] = [10.0452, 105.7469]; // Đảm bảo kiểu dữ liệu là [number, number]

function ResetCenterView({ selectPosition }: { selectPosition: any }) {
  const map = useMap();

  useEffect(() => {
    if (selectPosition) {
      map.setView(
        L.latLng(selectPosition?.lat, selectPosition?.lon),
        map.getZoom(),
        {
          animate: true,
        },
      );
    }
  }, [selectPosition, map]);

  return null;
}

export default function Maps({ selectPosition }: { selectPosition: any }) {
  const locationSelection: [number, number] = [
    selectPosition?.lat || 0,
    selectPosition?.lon || 0,
  ]; // Đảm bảo kiểu dữ liệu là [number, number]

  return (
    <MapContainer
      center={initialPosition} // Đặt vị trí ban đầu cố định
      zoom={12} // Đặt kích thước zoom cố định
      style={{ width: '100%', height: '200px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectPosition && (
        <Marker position={locationSelection} icon={icon}>
          <Popup>{selectPosition.display_name}</Popup>
        </Marker>
      )}
      <ResetCenterView selectPosition={selectPosition} />
    </MapContainer>
  );
}
