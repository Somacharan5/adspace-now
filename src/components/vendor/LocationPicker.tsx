import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths (Leaflet + bundlers issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
  height?: number;
};

const LocationPicker = ({ lat, lng, onPick, height = 300 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initLat = lat ?? 20.5937;
    const initLng = lng ?? 78.9629;
    const initZoom = lat && lng ? 13 : 5;

    const map = L.map(containerRef.current).setView([initLat, initLng], initZoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const { lat: la, lng: ln } = markerRef.current!.getLatLng();
        onPick(la, ln);
      });
    }

    map.on("click", (e) => {
      const { lat: la, lng: ln } = e.latlng;
      if (markerRef.current) markerRef.current.setLatLng([la, ln]);
      else {
        markerRef.current = L.marker([la, ln], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const { lat: dla, lng: dln } = markerRef.current!.getLatLng();
          onPick(dla, dln);
        });
      }
      onPick(la, ln);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ height, width: "100%" }} className="rounded-xl overflow-hidden border border-border" />;
};

export default LocationPicker;
