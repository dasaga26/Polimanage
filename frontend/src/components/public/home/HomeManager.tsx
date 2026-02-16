import { HeroSection } from './HeroSection';
import { FacilitiesGrid } from './FacilitiesGrid';
import { ClubsSection } from './ClubsSection';
import { CTABanner } from './CTABanner';

export function HomeManager() {
  return (
    <>
      <HeroSection />
      <FacilitiesGrid />
      <ClubsSection />
      <CTABanner />
    </>
  );
}
