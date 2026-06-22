const GA_TRACKING_ID = 'REPLACE_ME_GA_ID';
const GA_PLACEHOLDER = 'REPLACE_ME_' + 'GA_ID';

if (!GA_TRACKING_ID || GA_TRACKING_ID === GA_PLACEHOLDER) {
  console.warn('Google Analytics measurement ID is not configured.');
} else {
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID);
}
