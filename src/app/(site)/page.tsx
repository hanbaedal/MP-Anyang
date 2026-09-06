import { Suspense } from "react";
import { IntroGate } from "../../components/IntroGate";

function HomeContent() {
  return (
    <IntroGate>
      <div className="home-view">
        <section className="home-hero" style={{ backgroundImage: "url(/images/park-panorama.png)" }}>
          <div className="home-hero-copy">
            <p>ANYANG MEMORIAL PARK</p>
            <h1>안양공원묘원 전경</h1>
          </div>
        </section>
      </div>
    </IntroGate>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
