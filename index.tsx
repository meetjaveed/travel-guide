import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Circle, 
  Navigation2, 
  Info, 
  Compass, 
  RotateCcw,
  Satellite,
  Search,
  ChevronDown
} from 'lucide-react';

// --- Types ---
interface Spot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

interface CityGroup {
  city: string;
  spots: Spot[];
}

interface UserLocation {
  lat: number;
  lng: number;
}

// --- Data ---
const TRAVEL_DATA: CityGroup[] = [
  {
    city: "Agra",
    spots: [
      { id: "agra-1", name: "Taj Mahal", lat: 27.1751, lng: 78.0421, description: "A UNESCO World Heritage site and a symbol of eternal love built by Emperor Shah Jahan." },
      { id: "agra-2", name: "Agra Fort", lat: 27.1795, lng: 78.0211, description: "The main residence of the emperors of the Mughal Dynasty until 1638." },
      { id: "agra-3", name: "Jama Masjid Agra", lat: 27.1858, lng: 78.0163, description: "One of the largest mosques in India, built by Jahanara Begum." }
    ]
  },
  {
    city: "Lucknow",
    spots: [
      { id: "lko-1", name: "Bara Imambara", lat: 26.8689, lng: 80.9135, description: "An architectural marvel famous for its labyrinth (Bhulbhulaiya)." },
      { id: "lko-2", name: "Dargah Dada Miyan", lat: 26.8521, lng: 80.9322, description: "The holy shrine of Hazrat Shah Meena Shah, a central spiritual site in Lucknow." },
      { id: "lko-3", name: "Rumi Darwaza", lat: 26.8684, lng: 80.9122, description: "An imposing gateway built under the patronage of Nawab Asaf-ud-Daula." }
    ]
  },
  {
    city: "Bahraich",
    spots: [
      { id: "bah-1", name: "Dargah Syed Salar Masood Ghazi", lat: 27.5855, lng: 81.6033, description: "The famous 11th-century shrine visited by thousands for spiritual peace." }
    ]
  },
  {
    city: "Makanpur",
    spots: [
      { id: "mak-1", name: "Dargah Hazrat Zinda Shah Madar", lat: 26.8373, lng: 80.0465, description: "The shrine of the founder of the Madariyya Sufi order, one of India's oldest Sufi centers." }
    ]
  },
  {
    city: "Kichocha",
    spots: [
      { id: "kic-1", name: "Dargah Makhdoom Ashraf Semnani", lat: 26.4258, lng: 82.7569, description: "A world-famous shrine known for its spiritual tranquility and healing pond." }
    ]
  },
  {
    city: "Bareilly",
    spots: [
      { id: "bar-1", name: "Dargah-e-Ala Hazrat", lat: 28.3751, lng: 79.4144, description: "The resting place of Imam Ahmed Raza Khan, the renowned 19th-century polymath." }
    ]
  },
  {
    city: "Piran Kaliyar",
    spots: [
      { id: "pk-1", name: "Sabir Pak Dargah", lat: 29.9161, lng: 77.9351, description: "The revered 13th-century shrine of Alauddin Ali Ahmed Sabir Kaliyari." }
    ]
  },
  {
    city: "Sadhaura",
    spots: [
      { id: "sad-1", name: "Dargah Shah Qumais", lat: 30.3792, lng: 77.2025, description: "A historic shrine of the Qadiriya order in the Gumaisia region." }
    ]
  },
  {
    city: "Panipat",
    spots: [
      { id: "pan-1", name: "Dargah Bu Ali Shah Qalandar", lat: 29.3909, lng: 76.9744, description: "The shrine of the famous 13th-century Sufi saint from Azerbaijan." }
    ]
  },
  {
    city: "Delhi",
    spots: [
      { id: "del-1", name: "Nizamuddin Dargah", lat: 28.5913, lng: 77.2425, description: "The world-famous shrine of the Sufi saint Nizamuddin Auliya." },
      { id: "del-2", name: "Jama Masjid Delhi", lat: 28.6507, lng: 77.2334, description: "One of the largest mosques in India, built by Emperor Shah Jahan." }
    ]
  },
  {
    city: "Ajmer",
    spots: [
      { id: "aj-1", name: "Ajmer Sharif Dargah", lat: 26.4561, lng: 74.6284, description: "The holy shrine of Khwaja Moinuddin Chishti, 'Gharib Nawaz'." },
      { id: "aj-2", name: "Taragarh Fort", lat: 26.4468, lng: 74.6189, description: "A historic hill fort offering a panoramic view of the Ajmer city." },
      { id: "aj-3", name: "Adhai Din Ka Jhopda", lat: 26.4552, lng: 74.6251, description: "An ancient mosque built in 2.5 days by Qutb-ud-Din-Aibak." },
      { id: "aj-4", name: "Ana Sagar Lake", lat: 26.4741, lng: 74.6258, description: "A picturesque artificial lake with marble pavilions (Baradari)." },
      { id: "aj-5", name: "Pushkar Lake", lat: 26.4883, lng: 74.5518, description: "A sacred lake with 52 ghats, located 14km from Ajmer city." }
    ]
  }
];

// --- Utilities ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Main App ---
export default function App() {
  const [visited, setVisited] = useState<string[]>([]);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('hubli_quest_v2');
    if (saved) setVisited(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('hubli_quest_v2', JSON.stringify(visited));
  }, [visited]);

  const toggleVisit = useCallback((id: string) => {
    setVisited(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }, []);

  const initiateGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on this device.");
      return;
    }

    setTracking(true);
    setStatus("Locating you...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("Live Location Active");
        
        // Continuous watch
        navigator.geolocation.watchPosition(
          (wPos) => setUserLoc({ lat: wPos.coords.latitude, lng: wPos.coords.longitude }),
          (err) => console.error(err),
          { enableHighAccuracy: true }
        );
      },
      (err) => {
        alert("Location access denied. Please enable GPS for live distance tracking.");
        setTracking(false);
        setStatus(null);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const totalSpots = useMemo(() => TRAVEL_DATA.reduce((acc, c) => acc + c.spots.length, 0), []);
  const progress = Math.round((visited.length / totalSpots) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-32 overflow-x-hidden">
      {/* Header */}
      <div className="bg-indigo-700 text-white pt-10 pb-16 px-6 rounded-b-[40px] shadow-2xl sticky top-0 z-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-20 -left-10 w-32 h-32 bg-indigo-800 rounded-full blur-2xl opacity-40"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter leading-none">HUBLI QUEST</h1>
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">2026 Pilgrimage Guide</p>
          </div>
          <button 
            onClick={initiateGPS}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${
              tracking ? 'bg-green-500 text-white' : 'bg-white text-indigo-700'
            }`}
          >
            {tracking ? <Satellite size={24} className="animate-pulse" /> : <Navigation size={24} />}
          </button>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">
              {visited.length} / {totalSpots} VISITED
            </span>
            <span className="text-3xl font-black">{progress}%</span>
          </div>
          <div className="h-2 bg-indigo-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 transition-all duration-1000 ease-in-out shadow-[0_0_12px_rgba(74,222,128,0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          {status && (
            <div className="flex items-center gap-2 text-[9px] font-bold text-green-300 uppercase tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary */}
      <main className="px-5 mt-10 space-y-12">
        {TRAVEL_DATA.map((group) => (
          <section key={group.city} className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
              <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{group.city}</h2>
            </div>

            <div className="grid gap-5">
              {group.spots.map((spot) => {
                const isVisited = visited.includes(spot.id);
                const distance = userLoc 
                  ? getDistance(userLoc.lat, userLoc.lng, spot.lat, spot.lng) 
                  : null;

                return (
                  <div 
                    key={spot.id} 
                    className={`p-6 rounded-[32px] border transition-all duration-500 shadow-sm ${
                      isVisited ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white border-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider">{group.city}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            distance === null ? 'bg-slate-100 text-slate-400' : 
                            distance < 1 ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-500'
                          }`}>
                            {distance === null ? "GPS OFFLINE" : 
                             distance < 1 ? `${Math.round(distance * 1000)}m away` : 
                             `${distance.toFixed(1)} km away`}
                          </span>
                        </div>
                        <h4 className={`text-lg font-black leading-tight ${isVisited ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {spot.name}
                        </h4>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                        target="_blank"
                        className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                      >
                        <Navigation2 size={18} fill="currentColor" />
                      </a>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 italic">
                      {spot.description}
                    </p>

                    <button 
                      onClick={() => toggleVisit(spot.id)}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                        isVisited 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-900 text-white shadow-lg'
                      }`}
                    >
                      {isVisited ? <CheckCircle size={14} /> : <Circle size={14} />}
                      {isVisited ? "Visited" : "Mark Done"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Bottom Nav */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl py-4 px-8 rounded-full flex justify-between items-center z-50">
        <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="flex flex-col items-center gap-1 text-indigo-600">
          <MapPin size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Itinerary</span>
        </button>
        <button 
          onClick={() => {
            const next = TRAVEL_DATA.flatMap(c => c.spots).find(s => !visited.includes(s.id));
            if(next) {
              const el = document.getElementById(next.id);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center'});
            }
          }}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <Search size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Find Next</span>
        </button>
        <button 
          onClick={() => confirm("Reset all history?") && setVisited([])}
          className="flex flex-col items-center gap-1 text-red-400"
        >
          <RotateCcw size={22} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Reset</span>
        </button>
      </footer>
    </div>
  );
}
