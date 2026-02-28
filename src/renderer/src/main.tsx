import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { store } from './store'
import App from './App'

// Theme is intentionally minimal at this stage — full theming (light/dark/system)
// will be wired up once the settings slice is hydrated from the main process.
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif'
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
