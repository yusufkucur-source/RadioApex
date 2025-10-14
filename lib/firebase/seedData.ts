import { collection, addDoc, getDocs } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export const sampleDjs = [
  {
    nickname: "Aurora",
    fullName: "Ayşe K.",
    city: "İstanbul",
    photoUrl: "",
    description:
      "Organik house ile analog synthlerin sonsuz birleşimini sahneye taşıyan Aurora'nın setleri dinleyenleri gece yolculuğuna çıkarıyor."
  },
  {
    nickname: "Orbit",
    fullName: "Mehmet Y.",
    city: "İzmir",
    photoUrl: "",
    description:
      "Orbit, minimal techno ve break beat'i cesurca harmanlayarak Radio Apex gecelerine dinamizm katıyor."
  },
  {
    nickname: "Lumen",
    fullName: "Ece S.",
    city: "Berlin",
    photoUrl: "",
    description:
      "Karanlık disco ritimleri ve synth wave dokunuşlarıyla Lumen, gecenin atmosferine yeni bir boyut ekliyor."
  },
  {
    nickname: "Vertex",
    fullName: "Can D.",
    city: "Amsterdam",
    photoUrl: "",
    description:
      "Progressive house ve melodic techno'yu avangard soundscape'lerle harmanlayan Vertex, dinleyicileri derin bir sonic yolculuğa çıkarıyor."
  },
  {
    nickname: "Nova",
    fullName: "Elif M.",
    city: "Ankara",
    photoUrl: "",
    description:
      "Ambient textures ve downtempo ritimlerle gecenin sessiz anlarına dokunuş yapan Nova, elektronik müziğin meditatif yönünü keşfediyor."
  },
  {
    nickname: "Pulse",
    fullName: "Serkan T.",
    city: "London",
    photoUrl: "",
    description:
      "Energetik techno ve industrial soundların ustası Pulse, yüksek BPM'lerle dolu setleriyle dansçıları zaman algısından koparıyor."
  }
];

export const sampleLineup = [
  {
    day: "Monday",
    startTime: "20:00",
    endTime: "22:00",
    genre: "Organic House",
    title: "Moonlit Frequencies",
    djId: "" // Bu manuel olarak güncellenecek
  },
  {
    day: "Wednesday",
    startTime: "22:00",
    endTime: "00:00",
    genre: "Minimal Techno",
    title: "Orbital Sequences",
    djId: ""
  },
  {
    day: "Friday",
    startTime: "23:00",
    endTime: "01:00",
    genre: "Dark Disco",
    title: "Neon Echoes",
    djId: ""
  },
  {
    day: "Saturday",
    startTime: "21:00",
    endTime: "23:00",
    genre: "Progressive House",
    title: "Vertex Sessions",
    djId: ""
  },
  {
    day: "Sunday",
    startTime: "19:00",
    endTime: "21:00",
    genre: "Ambient",
    title: "Nova Soundscapes",
    djId: ""
  }
];

export async function seedDatabaseWithSampleData(db: Firestore): Promise<{
  success: boolean;
  message: string;
  djsAdded: number;
  lineupAdded: number;
}> {
  try {
    // DJ Collection'ı kontrol et
    const djsSnapshot = await getDocs(collection(db, "djs"));
    let djsAdded = 0;
    
    if (djsSnapshot.empty) {
      console.log("🎧 DJ collection boş, sample data ekleniyor...");
      for (const dj of sampleDjs) {
        await addDoc(collection(db, "djs"), {
          ...dj,
          createdAt: new Date()
        });
        djsAdded++;
      }
      console.log(`✅ ${djsAdded} DJ eklendi`);
    }

    // Lineup Collection'ı kontrol et
    const lineupSnapshot = await getDocs(collection(db, "lineup"));
    let lineupAdded = 0;
    
    if (lineupSnapshot.empty) {
      console.log("📅 Lineup collection boş, sample data ekleniyor...");
      for (const slot of sampleLineup) {
        await addDoc(collection(db, "lineup"), {
          ...slot,
          createdAt: new Date()
        });
        lineupAdded++;
      }
      console.log(`✅ ${lineupAdded} lineup slot eklendi`);
    }

    if (djsAdded > 0 || lineupAdded > 0) {
      return {
        success: true,
        message: `Database başarıyla seed edildi! ${djsAdded} DJ ve ${lineupAdded} show eklendi.`,
        djsAdded,
        lineupAdded
      };
    } else {
      return {
        success: true,
        message: "Database zaten dolu, seed atlanıyor.",
        djsAdded: 0,
        lineupAdded: 0
      };
    }
  } catch (error) {
    console.error("Seed işlemi başarısız:", error);
    return {
      success: false,
      message: `Hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      djsAdded: 0,
      lineupAdded: 0
    };
  }
}

