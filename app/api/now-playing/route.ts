import { NextResponse } from "next/server";

const STREAM_META_URL = "https://radio.cast.click/status-json.xsl";
const STREAM_PATH = "/radio/8000/radio.mp3";

type IcecastSource = {
  listenurl?: string;
  title?: string;
  artist?: string;
  server_name?: string;
  server_description?: string;
  stream_start_iso8601?: string;
  song?: string;
};

type IcecastPayload = {
  icestats?: {
    source?: IcecastSource | IcecastSource[];
  };
};

function parseSource(data: IcecastPayload): IcecastSource | null {
  if (!data.icestats || !data.icestats.source) {
    return null;
  }

  const { source } = data.icestats;
  if (Array.isArray(source)) {
    return (
      source.find(item =>
        item.listenurl ? item.listenurl.includes(STREAM_PATH) : false
      ) ?? source[0] ?? null
    );
  }

  return source;
}

export async function GET() {
  try {
    const response = await fetch(STREAM_META_URL, {
      headers: {
        "User-Agent": "RadioApex/1.0 (+https://radioapex.example.com)"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const body = (await response.json()) as IcecastPayload;
    const source = parseSource(body);

    const song =
      source?.song ??
      (source?.title && source?.artist
        ? `${source.artist} - ${source.title}`
        : source?.title);

    const [artist, title] =
      song && song.includes(" - ")
        ? song.split(" - ", 2)
        : [source?.artist ?? "", source?.title ?? song ?? ""];

    const payload = {
      title: title?.trim() || source?.title || "Radio Apex Live",
      artist: artist?.trim() || source?.artist || "",
      isLive: true,
      startedAt: source?.stream_start_iso8601 ?? null
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Now playing API error", error);
    return NextResponse.json(
      {
        title: "Radio Apex Live",
        artist: "",
        isLive: true,
        startedAt: null
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      }
    );
  }
}
