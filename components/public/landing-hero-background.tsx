/** Fond dynamique épuré pour le hero de la landing — CSS pur, tokens projet. */
export function LandingHeroBackground() {
  return (
    <div aria-hidden className="landing-hero-bg pointer-events-none absolute inset-0 overflow-hidden">
      <div className="landing-hero-mesh absolute inset-0" />
      <div className="landing-hero-orb landing-hero-orb-a" />
      <div className="landing-hero-orb landing-hero-orb-b" />
      <div className="landing-hero-orb landing-hero-orb-c" />
      <div className="landing-hero-grid absolute inset-0" />
      <div className="landing-hero-noise absolute inset-0" />
      <div className="landing-hero-fade absolute inset-x-0 bottom-0" />
    </div>
  );
}
