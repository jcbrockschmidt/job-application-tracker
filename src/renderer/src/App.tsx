import { useAppSelector } from './hooks'

export default function App(): JSX.Element {
  const activePage = useAppSelector((state) => state.ui.activePage)
  const onboardingComplete = useAppSelector((state) => state.settings.onboardingComplete)

  if (!onboardingComplete) {
    return (
      <main>
        {/* TODO: <OnboardingPage /> */}
        <p>Onboarding — not yet implemented</p>
      </main>
    )
  }

  return (
    <main>
      {activePage === 'masterList' && (
        // TODO: <MasterListPage />
        <p>Application Master List — not yet implemented</p>
      )}
      {activePage === 'session' && (
        // TODO: <SessionPage />
        <p>Session — not yet implemented</p>
      )}
      {activePage === 'settings' && (
        // TODO: <SettingsPage />
        <p>Settings — not yet implemented</p>
      )}
    </main>
  )
}
