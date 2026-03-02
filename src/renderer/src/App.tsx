// STUB: Phase 2 — restore sessions on launch not yet wired.
// TODO (Phase 2 restore sessions):
//   useEffect(() => {
//     window.api.sessions.getAll().then(sessions => {
//       dispatch(setSessions(sessions))
//       if (sessions.length > 0) {
//         dispatch(setActiveSessionId(sessions[0].id))
//         dispatch(setActivePage('session'))
//       }
//     })
//   }, [])

import { useAppSelector } from './hooks'
import AppShell from './components/organisms/AppShell'
import OnboardingPage from './components/pages/OnboardingPage'
import SessionPage from './components/pages/SessionPage'
import MasterListPage from './components/pages/MasterListPage'
import SettingsPage from './components/pages/SettingsPage'
import MasterCVPage from './components/pages/MasterCVPage'
// STUB: Phase 5
import WritingProfilePage from './components/pages/WritingProfilePage'

export default function App(): JSX.Element {
  // TODO: const dispatch = useAppDispatch()
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
        {/* STUB: Phase 3 */}
        {activePage === 'masterCV' && <MasterCVPage />}
        {/* STUB: Phase 5 */}
        {activePage === 'writingProfile' && <WritingProfilePage />}
      </AppShell>
    </>
  )
}
