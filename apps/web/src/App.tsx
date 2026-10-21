import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { SiteLayout } from "./components/SiteLayout";
import { ScrollToTop } from "./components/ScrollToTop";
import {
  InstallPrompt,
  OfflineBanner,
  UpdatePrompt,
} from "./components/PwaPrompts";
import { HomePage } from "./pages/HomePage";
import { GamePage } from "./pages/GamePage";
import { ResultPage } from "./pages/ResultPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { HowToPlayPage } from "./pages/HowToPlayPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <AuthProvider>
      <div className="cyber-grid scanlines min-h-dvh">
        <ScrollToTop />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="ranking" element={<LeaderboardPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="como-jogar" element={<HowToPlayPage />} />
            <Route path="resultado/:runId" element={<ResultPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="jogar" element={<GamePage />} />
        </Routes>
        <OfflineBanner />
        <InstallPrompt />
        <UpdatePrompt />
      </div>
    </AuthProvider>
  );
}
