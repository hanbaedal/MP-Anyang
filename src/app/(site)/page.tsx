import { IntroGate } from "@/components/IntroGate";

export default function HomePage() {
  return (
    <IntroGate>
      <section className="home-hero" style={{ backgroundImage: "url(/images/park-panorama.png)" }}>
        <div className="home-hero-copy">
          <p>ANYANG MEMORIAL PARK</p>
          <h1>안양공원묘지 전경</h1>
        </div>
      </section>
    </IntroGate>
  );
}
