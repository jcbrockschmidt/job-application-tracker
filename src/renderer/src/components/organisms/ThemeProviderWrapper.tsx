import React, { useMemo } from 'react'
import { ThemeProvider, createTheme, useMediaQuery, CssBaseline } from '@mui/material'
import { useAppSelector } from '../../hooks'

interface ThemeProviderWrapperProps {
  children: React.ReactNode
}

export default function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps): JSX.Element {
  const settingsTheme = useAppSelector((state) => state.settings.theme)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(() => {
    const mode = settingsTheme === 'system' ? (prefersDarkMode ? 'dark' : 'light') : settingsTheme

    return createTheme({
      palette: {
        mode,
        primary: {
          main: '#2563eb' // Blue 600
        },
        background: {
          default: mode === 'dark' ? '#0f172a' : '#f8fafc',
          paper: mode === 'dark' ? '#1e293b' : '#ffffff'
        }
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        h6: {
          fontSize: '1.25rem',
          lineHeight: 1.2
        },
        subtitle2: {
          fontSize: '0.875rem',
          lineHeight: 1.25
        }
      },
      shape: {
        borderRadius: 8
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500
            }
          }
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
            }
          }
        }
      }
    })
  }, [settingsTheme, prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
