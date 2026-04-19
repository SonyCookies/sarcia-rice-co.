"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

type AddressLeafletMapProps = {
  className?: string;
  geofenceRadiusMeters: number;
  isInteractive?: boolean;
  latitude: number | null;
  longitude: number | null;
  mapTheme: "street" | "satellite";
  onPickLocation: (latitude: number, longitude: number) => void;
};

const DEFAULT_CENTER: [number, number] = [13.033387, 121.492192];
const locationPinIcon = divIcon({
  className: "rice-location-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 9999px; background: linear-gradient(135deg, #4d6b35, #769158); box-shadow: 0 12px 24px rgba(77, 107, 53, 0.28); border: 3px solid #ffffff;">
      <div style="position: absolute; bottom: -8px; width: 12px; height: 12px; background: #4d6b35; transform: rotate(45deg); border-bottom-right-radius: 2px;"></div>
      <div style="width: 8px; height: 8px; border-radius: 9999px; background: #fff8e5;"></div>
    </div>
  `,
  iconAnchor: [13, 34],
  popupAnchor: [0, -28],
});

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapReadySync() {
  const map = useMapEvents({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [map]);

  return null;
}

function LocationPicker({
  onPickLocation,
}: {
  onPickLocation: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPickLocation(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function AddressLeafletMap({
  className = "h-72",
  geofenceRadiusMeters,
  isInteractive = true,
  latitude,
  longitude,
  mapTheme,
  onPickLocation,
}: AddressLeafletMapProps) {
  void geofenceRadiusMeters;
  const center: [number, number] =
    latitude !== null && longitude !== null
      ? [latitude, longitude]
      : DEFAULT_CENTER;
  
  const zoom = latitude !== null && longitude !== null ? 16 : 12;

  const tileLayer =
    mapTheme === "satellite"
      ? {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        }
      : {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#d8d4be]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={isInteractive}
        className={`${className} w-full`}
      >
        <MapReadySync />
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
        {isInteractive ? (
          <LocationPicker onPickLocation={onPickLocation} />
        ) : null}
        {latitude !== null && longitude !== null ? (
          <Marker
            position={[latitude, longitude]}
            icon={locationPinIcon}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}

