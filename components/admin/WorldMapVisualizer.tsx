"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import {
  Globe,
  Headphones,
  RefreshCw,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  Flame,
  Volume2,
  Maximize2,
  Navigation
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import type { ListenersApiResponse, ListenerMarker } from "@/app/api/admin/listeners/route";

interface WorldMapVisualizerProps {
  data: ListenersApiResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export function WorldMapVisualizer({ data, loading, onRefresh }: WorldMapVisualizerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const filteredMarkers = useMemo(() => {
    if (!data?.markers) return [];
    if (!activeCountry) return data.markers;
    return data.markers.filter((m) => m.country === activeCountry);
  }, [data?.markers, activeCountry]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [38.5, 30.0], // Centered around Turkey / Mediterranean / Europe
        zoom: 4,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
      });

      // ESRI Dark Gray Canvas (100% Free, NO API KEY required, sleek dark dashboard theme)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 16,
          attribution: "Tiles &copy; Esri"
        }
      ).addTo(map);

      // Boundaries and city labels overlay
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 16,
          pane: "overlayPane"
        }
      ).addTo(map);

      // Add custom zoom control at bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Layer group for listener pins
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;

      // Force layout calculation
      setTimeout(() => {
        if (isMounted && map) {
          map.invalidateSize();
        }
      }, 200);
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers when data or activeCountry changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;

      const L = (await import("leaflet")).default;
      const markersLayer = markersLayerRef.current;
      const map = mapInstanceRef.current;

      markersLayer.clearLayers();

      if (!filteredMarkers.length) return;

      const bounds = L.latLngBounds([]);

      filteredMarkers.forEach((m) => {
        const latLng: [number, number] = [m.lat, m.lon];
        bounds.extend(latLng);

        // Custom pulsing radar marker HTML
        const customIcon = L.divIcon({
          className: "custom-radar-marker",
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-pointer group">
              <span class="absolute w-7 h-7 rounded-full bg-orange-500/40 animate-ping"></span>
              <span class="absolute w-4 h-4 rounded-full bg-orange-500/60 blur-[1px]"></span>
              <span class="relative w-3 h-3 rounded-full bg-[#ff6b2c] border-2 border-white shadow-[0_0_12px_rgba(255,107,44,0.9)] transition-transform group-hover:scale-125"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -14]
        });

        const popupContent = `
          <div style="font-family: inherit; min-width: 190px; color: #fff; padding: 2px;">
            <div style="display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">${m.flag}</span>
              <div>
                <strong style="font-size: 13px; color: #fff; display: block;">${m.city}</strong>
                <span style="font-size: 11px; color: rgba(255,255,255,0.5);">${m.countryName}</span>
              </div>
            </div>
            <div style="font-size: 11px; line-height: 1.7; color: rgba(255,255,255,0.8);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: rgba(255,255,255,0.45);">⏱️ Dinleme:</span>
                <span style="color: #34d399; font-weight: 600;">${m.connectedTimeText}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: rgba(255,255,255,0.45);">📻 Yayın:</span>
                <span style="color: #ff6b2c; font-weight: 600;">${m.mount}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: rgba(255,255,255,0.45);">💻 Cihaz:</span>
                <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${m.device}</span>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker(latLng, { icon: customIcon }).bindPopup(popupContent, {
          className: "dark-map-popup",
          closeButton: false
        });

        markersLayer.addLayer(marker);
      });

      // Fit bounds if valid and not empty
      if (bounds.isValid() && filteredMarkers.length > 0) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8, animate: true });
      }
    }

    void updateMarkers();
  }, [filteredMarkers]);

  // Center map on Turkey / Europe
  const handleResetView = async () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([38.5, 30.0], 4, { duration: 1 });
    setActiveCountry(null);
  };

  // Center on all listeners
  const handleFitAll = async () => {
    if (!mapInstanceRef.current || !data?.markers?.length) return;
    const L = (await import("leaflet")).default;
    const bounds = L.latLngBounds(data.markers.map((m) => [m.lat, m.lon]));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 7, animate: true });
    }
    setActiveCountry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="absolute h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Canlı Radyo Dinleyicileri (Gerçek Zamanlı Harita)
            </h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              AzuraCast Canlı
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Karanlık mod interaktif dünya haritası; şehirleri, sokakları, dinleme sürelerini ve oynatıcıları gösterir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeCountry && (
            <button
              onClick={() => setActiveCountry(null)}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
            >
              Filtreyi Kaldır ({activeCountry}) ✕
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleFitAll}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            title="Tüm dinleyicileri ekrana sığdır"
          >
            <Navigation className="h-3.5 w-3.5 text-apex-accent" />
            Dinleyicilere Odaklan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            title="Varsayılan görünüme dön"
          >
            <Globe className="h-3.5 w-3.5" />
            Merkez
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#09090e] shadow-2xl">
        {/* Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          className="relative h-[480px] w-full z-0 cursor-grab active:cursor-grabbing"
          style={{ background: "#0c0c12" }}
        />

        {/* Global Dark Map CSS overrides */}
        <style jsx global>{`
          .leaflet-container {
            background-color: #09090d !important;
            font-family: inherit;
          }
          .leaflet-bar {
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            background: rgba(12, 12, 16, 0.9) !important;
            backdrop-filter: blur(8px);
            border-radius: 8px !important;
            overflow: hidden;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5) !important;
          }
          .leaflet-bar a {
            background-color: rgba(12, 12, 16, 0.9) !important;
            color: #ffffff !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .leaflet-bar a:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #ff6b2c !important;
          }
          .dark-map-popup .leaflet-popup-content-wrapper {
            background: rgba(10, 10, 14, 0.95) !important;
            color: #fff !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            border-radius: 12px !important;
            backdrop-filter: blur(12px) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
            padding: 4px !important;
          }
          .dark-map-popup .leaflet-popup-tip {
            background: rgba(10, 10, 14, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
          }
        `}</style>

        {/* Map Header Overlay Badge */}
        <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-white/15 bg-black/75 px-3 py-2 text-xs backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-apex-accent" />
          <span className="font-semibold text-white">Canlı Dünya Haritası</span>
          <span className="text-white/40">|</span>
          <span className="text-emerald-400 font-medium">%{100} Canlı Takip</span>
        </div>

        {/* Map Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#0c0c12]/90 px-5 py-3 text-xs text-white/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-apex-accent shadow-[0_0_8px_#ff6b2c]" />
              <span className="text-white/80">Yanıp sönen nokta = Canlı dinleyici</span>
            </span>
            <span className="hidden sm:inline-block text-white/20">•</span>
            <span className="hidden sm:inline-block">Noktaya tıklayarak detayları görebilirsiniz</span>
          </div>

          <div className="flex items-center gap-2 font-medium text-white/80">
            <span>Şu Anki Canlı Dinleyici:</span>
            <span className="rounded bg-apex-accent/20 px-2.5 py-0.5 font-bold text-apex-accent text-sm">
              {data?.total || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Country Breakdown, Top Cities, and Mount Bitrates */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Country Breakdown */}
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-apex-accent" />
              Ülke Dağılımı
            </h3>
            <span className="text-xs text-white/40">
              {data?.countries.length || 0} Ülke
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {data?.countries && data.countries.length > 0 ? (
              data.countries.map((c) => {
                const isSelected = activeCountry === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      const next = isSelected ? null : c.code;
                      setActiveCountry(next);
                      if (next && mapInstanceRef.current) {
                        const match = data.markers.find((m) => m.country === next);
                        if (match) {
                          mapInstanceRef.current.flyTo([match.lat, match.lon], 6, { duration: 1 });
                        }
                      }
                    }}
                    className={clsx(
                      "w-full rounded-lg p-2.5 text-left transition",
                      isSelected
                        ? "bg-apex-accent/20 border border-apex-accent/40 shadow-sm"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="font-medium text-white/90">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/45">%{c.percentage}</span>
                        <strong className="text-sm font-semibold text-white">
                          {c.count}
                        </strong>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-apex-accent transition-all duration-500"
                        style={{ width: `${Math.max(8, c.percentage)}%` }}
                      />
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-white/40">Veri bulunmuyor.</p>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-apex-accent" />
              Şehir Dağılımı
            </h3>
            <span className="text-xs text-white/40">En çok dinleyenler</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {data?.cities && data.cities.length > 0 ? (
              data.cities.map((city, idx) => (
                <button
                  key={`${city.city}-${idx}`}
                  onClick={() => {
                    const match = data.markers.find((m) => m.city === city.city);
                    if (match && mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([match.lat, match.lon], 9, { duration: 1.2 });
                    }
                  }}
                  className="w-full flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm text-left hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{city.flag}</span>
                    <span className="font-medium text-white/85">{city.city}</span>
                    <span className="text-xs text-white/40">({city.countryName})</span>
                  </div>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
                    {city.count} kişi
                  </span>
                </button>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-white/40">Şehir verisi yok.</p>
            )}
          </div>
        </div>

        {/* Quality / Mounts & Devices */}
        <div className="space-y-6">
          {/* Mounts / Bitrate */}
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-apex-accent" />
                Yayın Kalitesi Dağılımı
              </h3>
            </div>

            <div className="mt-4 space-y-2.5">
              {data?.mounts && data.mounts.length > 0 ? (
                data.mounts.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-white/80">{m.name}</span>
                    <span className="font-semibold text-apex-accent">{m.count} dinleyici</span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-white/40">Yayın verisi yok.</p>
              )}
            </div>
          </div>

          {/* Live Listeners Feed Mini Table */}
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              Canlı Dinleyici Akışı
            </h3>

            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
              {data?.markers && data.markers.length > 0 ? (
                data.markers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([m.lat, m.lon], 10, { duration: 1 });
                      }
                    }}
                    className="w-full text-left flex items-center justify-between rounded-md border border-white/5 bg-black/20 p-2 text-xs hover:bg-white/5 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">
                        {m.flag} {m.city}
                      </p>
                      <p className="truncate text-[11px] text-white/45">
                        {m.device} • {m.mount}
                      </p>
                    </div>
                    <span className="shrink-0 text-right font-mono text-[11px] text-emerald-400">
                      {m.connectedTimeText}
                    </span>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-white/40">Bağlı dinleyici yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
