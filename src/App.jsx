import { useEffect } from 'react';
import { Layout } from './components/Layout.jsx';
import { CollectionPage } from './pages/CollectionPage.jsx';
import { OrganizationPage } from './pages/OrganizationPage.jsx';
import { PaymentsPage } from './pages/PaymentsPage.jsx';
import { RegionPage } from './pages/RegionPage.jsx';
import { AboutPage, ContactPage, DonatePage, HomePage } from './pages/StaticPages.jsx';
import { LanguageProvider } from './state/LanguageContext.jsx';
import { ThemeProvider } from './state/ThemeContext.jsx';
import { useHashRoute } from './router/useHashRoute.js';

const pageTitles = {
  '/': '빛청모 | Shining Us',
  '/about': '단체 소개 | About',
  '/activities': '활동공유 | Activities',
  '/statements': '성명 | Statements',
  '/payments': '지출내역 | Expense Reports',
  '/contact': '문의하기 | Contact',
  '/donate': '후원하기 | Donate',
  '/region': '지역 지부 | Regional Branches',
  '/organization': '조직도 | Organization Structure'
};

function resolvePage(route) {
  if (route.path === '/') {
    return <HomePage />;
  }
  if (route.path === '/about') {
    return <AboutPage />;
  }
  if (route.path === '/activities') {
    return <CollectionPage type="activities" slug={route.params.slug} />;
  }
  if (route.path === '/statements') {
    return <CollectionPage type="statements" slug={route.params.slug} />;
  }
  if (route.path === '/payments') {
    return <PaymentsPage />;
  }
  if (route.path === '/contact') {
    return <ContactPage />;
  }
  if (route.path === '/donate') {
    return <DonatePage />;
  }
  if (route.path === '/region') {
    return <RegionPage />;
  }
  if (route.path === '/organization') {
    return <OrganizationPage />;
  }
  return <HomePage />;
}

export default function App() {
  const route = useHashRoute();

  useEffect(() => {
    document.title = pageTitles[route.path] || pageTitles['/'];
  }, [route.path]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Layout activePath={route.path}>{resolvePage(route)}</Layout>
      </LanguageProvider>
    </ThemeProvider>
  );
}
