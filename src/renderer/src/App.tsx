import { useAppSelector } from './hooks'
import AppShell from './components/organisms/AppShell'
import OnboardingPage from './components/pages/OnboardingPage'
import SessionPage from './components/pages/SessionPage'
import MasterListPage from './components/pages/MasterListPage'
import SettingsPage from './components/pages/SettingsPage'

export default function App(): JSX.Element {
  const activePage = useAppSelector((state) => state.ui.activePage)
  const onboardingComplete = useAppSelector((state) => state.settings.onboardingComplete)

  return (
    <>
      {/* Onboarding overlays on top of the app shell until setup is complete */}
      {!onboardingComplete && <OnboardingPage />}

      <AppShell>
        {activePage === 'masterList' && <MasterListPage />}
        {activePage === 'session' && <SessionPage />}
        {activePage === 'settings' && <SettingsPage />}
        {/* TODO: 'masterCV' page (Phase 3), 'writingProfile' page (Phase 5) */}
      </AppShell>
    </>
  )
}
