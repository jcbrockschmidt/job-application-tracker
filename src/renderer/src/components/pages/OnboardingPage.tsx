// Onboarding wizard: shown on first launch when onboardingComplete === false.
// Four steps: (1) API key, (2) contact info, (3) upload resume, (4) upload cover letter.
// Closing the wizard sets onboardingComplete = true in Redux and persists to settings.
//
// STUB: Phase 1 — step structure and state shape are defined; each step is a placeholder.
// TODO:
//   - Step 1: text input + Validate button → window.api.settings.validateApiKey(key)
//             advance only on success; inline error on failure; persist key on success
//   - Step 2: form for fullName (req), phone (req), email (req), linkedin, github
//             → window.api.settings.save({ contactInfo })
//   - Step 3: file picker (PDF, DOCX, TXT, required) → window.api.docs.ingest(path, 'resume')
//             show progress spinner; inline error (image-only PDF, corrupt, password-protected)
//   - Step 4: same file picker pattern for cover letter; optional; Skip button
//             → window.api.docs.ingest(path, 'cover_letter') if file selected
//   - "Get Started" on step 4: dispatch setOnboardingComplete(true),
//             call window.api.settings.save({ ...currentSettings })

import { Box, Paper, Typography, Button, Stepper, Step, StepLabel } from '@mui/material'

const STEPS = ['API Key', 'Contact Info', 'Upload Resume', 'Upload Cover Letter']

export default function OnboardingPage(): JSX.Element {
  // TODO: const [activeStep, setActiveStep] = useState(0)
  // TODO: const dispatch = useAppDispatch()

  const activeStep = 0 // placeholder

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: 560,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ px: 4, pt: 4, pb: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Welcome to Resume Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete setup to start generating tailored resumes.
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 4, pb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step content */}
        <Box sx={{ px: 4, flex: 1, overflowY: 'auto', pb: 2 }}>
          {/* TODO: render the active step component:
               activeStep === 0 → <StepApiKey />
               activeStep === 1 → <StepContactInfo />
               activeStep === 2 → <StepUploadResume />
               activeStep === 3 → <StepUploadCoverLetter /> */}
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Step {activeStep + 1} — not yet implemented
          </Typography>
        </Box>

        {/* Footer actions */}
        <Box
          sx={{
            px: 4,
            py: 2.5,
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          {/* TODO: disabled on step 0 */}
          <Button color="inherit" disabled>
            Back
          </Button>

          {/* TODO: "Get Started" on last step, "Next" otherwise */}
          {/* TODO: disabled while validating / ingesting */}
          <Button variant="contained" disableElevation>
            {activeStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
