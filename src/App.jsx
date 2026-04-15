import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppShell from './components/layout/AppShell';

// Core pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import MapPage from './pages/Map';
import Profile from './pages/Profile';

// Stub pages
import {
  Analytics, Statistics, SkillProfile, MyCatches, FishingDiary, FishIdentify,
  FishMeasure, CatchMap, MyLicenses, MyBookings, Regulations, LicenseSearch,
  Teams, Competitions, Challenges, CleanupChallenges, Leaderboard, Tournaments,
  Coaches, BookCoach, GuideDirectory, Feed, AnglerChat, AnglerSystem,
  FishEncyclopedia, FishFamilies, SeasonGuide, Angelschule, BaitCatalog,
  BaitDatabase, CatchForecast, TideCatch, AIInsights, Subscription, Roadmap,
  Admin, LandingPage, Imprint, PrivacyPolicy, TermsOfService
} from './pages/stub/StubPages';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-abyss-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-tide flex items-center justify-center glow-tide">
            <span className="text-2xl">🎣</span>
          </div>
          <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Core pages */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<Profile />} />

        {/* Stub pages */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/skillprofile" element={<SkillProfile />} />
        <Route path="/mycatches" element={<MyCatches />} />
        <Route path="/fishingdiary" element={<FishingDiary />} />
        <Route path="/fishidentify" element={<FishIdentify />} />
        <Route path="/fishmeasure" element={<FishMeasure />} />
        <Route path="/catchmap" element={<CatchMap />} />
        <Route path="/mylicenses" element={<MyLicenses />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/regulations" element={<Regulations />} />
        <Route path="/licensesearch" element={<LicenseSearch />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/cleanupchallenges" element={<CleanupChallenges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/bookcoach" element={<BookCoach />} />
        <Route path="/guidedirectory" element={<GuideDirectory />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/anglerchat" element={<AnglerChat />} />
        <Route path="/anglersystem" element={<AnglerSystem />} />
        <Route path="/fishencyclopedia" element={<FishEncyclopedia />} />
        <Route path="/fishfamilies" element={<FishFamilies />} />
        <Route path="/seasonguide" element={<SeasonGuide />} />
        <Route path="/angelschule" element={<Angelschule />} />
        <Route path="/baitcatalog" element={<BaitCatalog />} />
        <Route path="/baitdatabase" element={<BaitDatabase />} />
        <Route path="/catchforecast" element={<CatchForecast />} />
        <Route path="/tidecatch" element={<TideCatch />} />
        <Route path="/aiinsights" element={<AIInsights />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/imprint" element={<Imprint />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/termsofservice" element={<TermsOfService />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;