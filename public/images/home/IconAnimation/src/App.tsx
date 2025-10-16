import { useState, useEffect } from 'react';

export default function App() {
  const [scrollRotation, setScrollRotation] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Scroll pozisyonuna göre rotasyon açısını hesapla
      const scrollY = window.scrollY;
      const rotation = scrollY * 0.5; // Her pixel scroll için 0.5 derece dönüş
      setScrollRotation(rotation);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scale hesaplama - scroll 0'da scale 0, scroll arttıkça 1'e ulaşır
  const maxScroll = 500; // 500px scroll sonrası tam boyut
  const scale = Math.min(scrollRotation / (maxScroll * 0.5), 1);

  return (
    <div className="min-h-[300vh] bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Sabit konumda dönen amblem */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <img
          src="/images/home/SVG/logo_icon.svg"
          alt="Dönen Amblem"
          className="w-32 h-32 md:w-48 md:h-48 transition-transform duration-100"
          style={{ transform: `rotate(${scrollRotation}deg) scale(${scale})` }}
        />
      </div>

      {/* Scroll yapılabilmesi için içerik */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-16">
          <section className="py-20">
            <h1 className="text-5xl mb-6">Scroll Yaparak Deneyin</h1>
            <p className="text-xl text-gray-600">
              Aşağı kaydırdıkça amblem dönecek
            </p>
          </section>

          <section className="py-20 bg-white/50 backdrop-blur rounded-lg p-8">
            <h2 className="text-3xl mb-4">Bölüm 1</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Sayfa boyunca scroll yapın ve ortadaki amblemin nasıl döndüğünü izleyin. 
              Scroll hızınıza göre dönüş hızı değişecektir.
            </p>
          </section>

          <section className="py-20 bg-white/50 backdrop-blur rounded-lg p-8">
            <h2 className="text-3xl mb-4">Bölüm 2</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Her scroll hareketi amblemi döndürür. Bu efekt, kullanıcı deneyimini 
              daha dinamik ve ilgi çekici hale getirir.
            </p>
          </section>

          <section className="py-20 bg-white/50 backdrop-blur rounded-lg p-8">
            <h2 className="text-3xl mb-4">Bölüm 3</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Scroll animasyonu, modern web tasarımında sıkça kullanılan bir tekniktir.
              Sayfa etkileşimini artırır ve kullanıcının dikkatini çeker.
            </p>
          </section>

          <section className="py-20">
            <h2 className="text-3xl mb-4">Sayfa Sonu</h2>
            <p className="text-gray-600">
              Yukarı scroll yaparak amblemin ters yönde döndüğünü görebilirsiniz
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
