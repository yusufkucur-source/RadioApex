import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AzuraCastListener = {
  ip?: string;
  hash?: string;
  mount_name?: string;
  connected_on?: number;
  connected_time?: number;
  device?: {
    client?: string;
    is_browser?: boolean;
    is_mobile?: boolean;
    is_bot?: boolean;
    browser_family?: string;
    os_family?: string;
  };
  location?: {
    description?: string;
    region?: string;
    city?: string;
    country?: string;
    lat?: string | number;
    lon?: string | number;
  };
};

export type ListenerMarker = {
  id: string;
  country: string;
  countryName: string;
  flag: string;
  city: string;
  region: string;
  description: string;
  lat: number;
  lon: number;
  connectedTime: number;
  connectedTimeText: string;
  mount: string;
  device: string;
  isMobile: boolean;
};

export type CountryStat = {
  code: string;
  name: string;
  flag: string;
  count: number;
  percentage: number;
};

export type CityStat = {
  city: string;
  country: string;
  countryName: string;
  flag: string;
  count: number;
};

export type ListenersApiResponse = {
  total: number;
  countries: CountryStat[];
  cities: CityStat[];
  mounts: Array<{ name: string; count: number }>;
  markers: ListenerMarker[];
  generatedAt: string;
};

let cache: { data: ListenersApiResponse; expiresAt: number } | null = null;

function getFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

function getCountryName(code?: string): string {
  if (!code) return "Bilinmiyor";
  try {
    const displayNames = new Intl.DisplayNames(["tr"], { type: "region" });
    return displayNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "Yeni bağlandı";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} sa ${minutes} dk`;
  }
  if (minutes > 0) {
    return `${minutes} dk`;
  }
  return `${seconds} sn`;
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store"
      }
    );
    if (!response.ok) return false;
    const payload = (await response.json()) as { users?: unknown[] };
    return Array.isArray(payload.users) && payload.users.length > 0;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 10 saniyelik hafif önbellek
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.data);
  }

  const baseUrl = (process.env.AZURACAST_BASE_URL || "https://radio.cast.click").replace(/\/$/, "");
  const stationId = process.env.AZURACAST_STATION_ID || "3";
  const apiKey = process.env.AZURACAST_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AzuraCast API Key is not configured." },
      { status: 500 }
    );
  }

  try {
    const url = `${baseUrl}/api/station/${stationId}/listeners`;
    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AzuraCast API returned ${response.status}: ${errorText}`);
    }

    const rawListeners = (await response.json()) as AzuraCastListener[];
    const list = Array.isArray(rawListeners) ? rawListeners : [];

    // Harita ve dinleyici işaretçileri
    const markers: ListenerMarker[] = [];
    const countryCounts: Record<string, number> = {};
    const cityCounts: Record<string, { city: string; country: string; count: number }> = {};
    const mountCounts: Record<string, number> = {};

    list.forEach((item, index) => {
      const countryCode = (item.location?.country || "XX").toUpperCase();
      const countryName = getCountryName(countryCode);
      const flag = getFlagEmoji(countryCode);
      const city = item.location?.city || item.location?.region || "Bilinmeyen Şehir";
      const region = item.location?.region || "";
      const description = item.location?.description || `${city}, ${countryCode}`;

      let lat = Number(item.location?.lat);
      let lon = Number(item.location?.lon);

      // Geçersiz koordinat kontrolü
      if (isNaN(lat) || isNaN(lon) || (lat === 0 && lon === 0)) {
        lat = 39.0;
        lon = 35.0;
      }

      // Aynı koordinattaki birden fazla dinleyicinin haritada üst üste çakışmaması için ufak rastgele kaydırma (jitter)
      const jitterLat = lat + (Math.random() - 0.5) * 0.25;
      const jitterLon = lon + (Math.random() - 0.5) * 0.25;

      const connectedTime = item.connected_time || 0;
      const mount = item.mount_name || "Standart";
      const device = item.device?.client || item.device?.os_family || "Bilinmiyor";
      const isMobile = Boolean(item.device?.is_mobile);

      markers.push({
        id: item.hash || `listener-${index}`,
        country: countryCode,
        countryName,
        flag,
        city,
        region,
        description,
        lat: jitterLat,
        lon: jitterLon,
        connectedTime,
        connectedTimeText: formatDuration(connectedTime),
        mount,
        device,
        isMobile
      });

      // İstatistikler
      countryCounts[countryCode] = (countryCounts[countryCode] || 0) + 1;

      const cityKey = `${city}-${countryCode}`;
      if (!cityCounts[cityKey]) {
        cityCounts[cityKey] = { city, country: countryCode, count: 0 };
      }
      cityCounts[cityKey].count += 1;

      mountCounts[mount] = (mountCounts[mount] || 0) + 1;
    });

    const total = markers.length;

    const countries: CountryStat[] = Object.entries(countryCounts)
      .map(([code, count]) => ({
        code,
        name: getCountryName(code),
        flag: getFlagEmoji(code),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const cities: CityStat[] = Object.values(cityCounts)
      .map((item) => ({
        city: item.city,
        country: item.country,
        countryName: getCountryName(item.country),
        flag: getFlagEmoji(item.country),
        count: item.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const mounts = Object.entries(mountCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const data: ListenersApiResponse = {
      total,
      countries,
      cities,
      mounts,
      markers,
      generatedAt: new Date().toISOString()
    };

    cache = {
      data,
      expiresAt: Date.now() + 10 * 1000 // 10 saniye cache
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("AzuraCast listeners API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch listeners from AzuraCast" },
      { status: 502 }
    );
  }
}
