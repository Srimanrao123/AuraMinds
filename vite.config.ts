import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function metaPixelHtmlPlugin(pixelId: string): Plugin {
  return {
    name: 'inject-meta-pixel-head',
    transformIndexHtml(html) {
      if (!pixelId) {
        return html.replace('<!-- META_PIXEL_SNIPPET -->', '');
      }

      const snippet = `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

      return html.replace('<!-- META_PIXEL_SNIPPET -->', snippet);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', 'VITE_']);
  const pixelId =
    env.REACT_APP_FACEBOOK_PIXEL_ID?.trim() ||
    env.VITE_FACEBOOK_PIXEL_ID?.trim() ||
    '';

  return {
    plugins: [react(), metaPixelHtmlPlugin(pixelId)],
    envPrefix: ['VITE_', 'REACT_APP_'],
  };
});
