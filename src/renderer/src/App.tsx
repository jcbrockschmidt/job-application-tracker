import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useAppDispatch, useAppSelector } from './hooks'
import { hydrate as hydrateSettings } from './store/slices/settingsSlice'
import { hydrate as hydrateSessions, setActiveSession } from './store/slices/sessionsSlice'
import { setActivePage } from './store/slices/uiSlice'
import AppShell from './components/organisms/AppShell'
import OnboardingPage from './components/pages/OnboardingPage'
import SessionPage from './components/pages/SessionPage'
import MasterListPage from './components/pages/MasterListPage'
import SettingsPage from './components/pages/SettingsPage'
import MasterCVPage from './components/pages/MasterCVPage'
// STUB: Phase 5
import WritingProfilePage from './components/pages/WritingProfilePage'

export default function App(): JSX.Element {
  const dispatch = useAppDispatch()
  const activePage = useAppSelector((state) => state.ui.activePage)
  const onboardingComplete = useAppSelector((state) => state.settings.onboardingComplete)
  const initialized = useAppSelector((state) => state.settings.initialized)

  useEffect(() => {
    window.api.settings.get().then((settings) => {
      dispatch(hydrateSettings(settings))
    })
    window.api.sessions.getAll().then((sessions) => {
      if (sessions.length > 0) {
        dispatch(hydrateSessions({ sessions, activeSessionId: sessions[0].id }))
        dispatch(setActivePage('session'))
      }
    })
  }, [dispatch])

  if (!initialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={48} thickness={4} />
      </Box>
    )
  }

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
