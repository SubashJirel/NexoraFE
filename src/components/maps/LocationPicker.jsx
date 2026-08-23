import { useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, LoaderCircle, MapPin, Search, Trash2 } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

const NEPAL_CENTER = [28.3949, 84.124];
const NEPAL_ZOOM = 7;
const SEARCH_ENDPOINT = "https://photon.komoot.io/api/";

const locationIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function validCoordinate(value, low, high) {
  if (value === null || value === undefined || value === "") return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= low && number <= high;
}

function MapClickPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng, "Pinned on map");
    },
  });
  return null;
}

function resultLabel(result) {
  const properties = result.properties || {};
  return [...new Set([
    properties.name,
    properties.street,
    properties.locality,
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.country,
  ].filter(Boolean))].join(", ");
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  title = "Office map location",
  description = "Search for a place or landmark, or click the map to place a draggable pin.",
  savedLocationLabel = "Saved office location",
}) {
  const mapRef = useRef(null);
  const requestRef = useRef(null);
  const hasLocation = validCoordinate(latitude, -90, 90) && validCoordinate(longitude, -180, 180);
  const position = useMemo(
    () => (hasLocation ? [Number(latitude), Number(longitude)] : null),
    [hasLocation, latitude, longitude],
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(hasLocation ? savedLocationLabel : "");

  useEffect(() => () => requestRef.current?.abort(), []);

  function chooseLocation(lat, lng, label) {
    const nextLatitude = Number(Number(lat).toFixed(6));
    const nextLongitude = Number(Number(lng).toFixed(6));
    setSelectedLabel(label);
    setMessage("");
    onChange({ latitude: nextLatitude, longitude: nextLongitude });
  }

  async function searchPlaces(event) {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2) {
      setMessage("Enter at least two characters to search Nepal.");
      setResults([]);
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setSearching(true);
    setMessage("");
    try {
      const params = new URLSearchParams({
        q: term,
        bbox: "80.0,26.3,88.3,30.5",
        limit: "5",
      });
      const response = await fetch(`${SEARCH_ENDPOINT}?${params}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Location search is temporarily unavailable.");
      const data = await response.json();
      const features = (Array.isArray(data?.features) ? data.features : []).filter((feature) => {
        const countryCode = String(feature.properties?.countrycode || "").toUpperCase();
        return countryCode === "NP" || feature.properties?.country === "Nepal";
      });
      setResults(features);
      if (!features.length) setMessage("No matching place or landmark was found in Nepal.");
    } catch (error) {
      if (error.name !== "AbortError") {
        setResults([]);
        setMessage(error.message || "Unable to search locations right now.");
      }
    } finally {
      if (requestRef.current === controller) setSearching(false);
    }
  }

  function selectResult(result) {
    const [longitude, latitude] = result.geometry.coordinates;
    const label = resultLabel(result) || "Selected search result";
    chooseLocation(latitude, longitude, label);
    setQuery(label);
    setResults([]);
    mapRef.current?.flyTo([Number(latitude), Number(longitude)], 16, { duration: 0.8 });
  }

  function clearLocation() {
    setResults([]);
    setSelectedLabel("");
    setMessage("");
    onChange({ latitude: null, longitude: null });
    mapRef.current?.flyTo(NEPAL_CENTER, NEPAL_ZOOM, { duration: 0.8 });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#DDE5E3] bg-white sm:col-span-2">
      <div className="space-y-3 border-b border-[#DDE5E3] p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#263238]">{title}</p>
            <p className="mt-1 text-xs leading-5 text-[#637079]">
              {description}
            </p>
          </div>
          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={13} /> Clear pin
            </button>
          )}
        </div>

        <form onSubmit={searchPlaces} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b969d]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search e.g. Durbar Marg, Boudha, Pokhara Airport"
              aria-label="Search a place or landmark in Nepal"
              className="h-10 w-full rounded-lg border border-[#DDE5E3] bg-white pl-9 pr-3 text-sm text-[#263238] outline-none transition focus:border-[#496B5A] focus:ring-2 focus:ring-[#496B5A]/15"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#496B5A] px-4 text-sm font-semibold text-white transition hover:bg-[#3a5649] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />}
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {message && (
          <p className="flex items-center gap-2 text-xs text-amber-700" role="status">
            <CircleAlert size={14} /> {message}
          </p>
        )}
        {results.length > 0 && (
          <div className="divide-y divide-[#E8EEEC] overflow-hidden rounded-lg border border-[#DDE5E3]" role="listbox" aria-label="Location search results">
            {results.map((result) => (
              <button
                type="button"
                key={`${result.properties?.osm_type}-${result.properties?.osm_id}-${result.geometry.coordinates.join("-")}`}
                onClick={() => selectResult(result)}
                className="flex w-full items-start gap-2 bg-white px-3 py-2.5 text-left text-xs leading-5 text-[#445159] transition hover:bg-[#F3F7F5]"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#496B5A]" />
                <span>{resultLabel(result)}</span>
              </button>
            ))}
          </div>
        )}
        {hasLocation && selectedLabel && (
          <p className="flex items-start gap-2 rounded-lg bg-[#F3F7F5] px-3 py-2 text-xs leading-5 text-[#496B5A]">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span><strong className="font-semibold">Location pinned:</strong> {selectedLabel}</span>
          </p>
        )}
        <p className="text-[10px] text-[#8b969d]">
          Location search by <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer" className="underline">Photon</a> using OpenStreetMap data.
        </p>
      </div>

      <MapContainer
        ref={mapRef}
        center={position || NEPAL_CENTER}
        zoom={position ? 15 : NEPAL_ZOOM}
        scrollWheelZoom
        className="h-[360px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickPicker onPick={chooseLocation} />
        {position && (
          <Marker
            position={position}
            icon={locationIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const next = event.target.getLatLng();
                chooseLocation(next.lat, next.lng, "Pin moved on map");
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
