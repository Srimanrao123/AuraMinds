import landingBody from '../content/landingBody.html?raw';
import { useLandingPageEffects } from '../hooks/useLandingPageEffects';

export function HomePage() {
  useLandingPageEffects();

  return (
    <div
      className="bg-background"
      dangerouslySetInnerHTML={{ __html: landingBody }}
    />
  );
}
