// Onboarding wizard: shown on first launch when onboardingComplete === false.
// Four steps: (1) API key, (2) contact info, (3) upload resume, (4) upload cover letter.
// Closing the wizard sets onboardingComplete = true in Redux and persists to settings.

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material'
import { useAppDispatch } from '../../hooks'
import { setOnboardingComplete, setContactInfo } from '../../store/slices/settingsSlice'
import type { ContactInfo } from '@shared/types'

const STEPS = ['API Key', 'Contact Info', 'Upload Resume', 'Upload Cover Letter']

// ── Step 1: API Key ───────────────────────────────────────────────────────────

interface StepApiKeyProps {
  onSuccess: () => void
}

function StepApiKey({ onSuccess }: StepApiKeyProps): JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleValidate(): Promise<void> {
    if (!apiKey.trim()) {
      setError('Please enter your API key.')
      return
    }
    setValidating(true)
    setError(null)
    try {
      const ok = await window.api.settings.validateApiKey(apiKey.trim())
      if (ok) {
        onSuccess()
      } else {
        setError('Invalid API key. Please check the key and try again.')
      }
    } catch {
      setError('Validation failed. Check your internet connection and try again.')
    } finally {
      setValidating(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Enter your Anthropic API key. It will be stored securely in your OS keychain and never
        written to disk.
      </Typography>
      <TextField
        label="Anthropic API Key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleValidate()
        }}
        placeholder="sk-ant-..."
        fullWidth
        size="small"
        inputRef={inputRef}
        disabled={validating}
      />
      {error && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleValidate}
          disabled={validating || !apiKey.trim()}
          startIcon={validating ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {validating ? 'Validating…' : 'Validate'}
        </Button>
      </Box>
    </Box>
  )
}

// ── Step 2: Contact Info ──────────────────────────────────────────────────────

interface StepContactInfoProps {
  onNext: (info: ContactInfo) => void
}

function StepContactInfo({ onNext }: StepContactInfoProps): JSX.Element {
  const [fields, setFields] = useState<ContactInfo>({
    fullName: '',
    phone: '',
    email: '',
    linkedin: '',
    github: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInfo, string>>>({})
  const [saving, setSaving] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  function update(key: keyof ContactInfo, value: string): void {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleNext(): Promise<void> {
    const newErrors: Partial<Record<keyof ContactInfo, string>> = {}
    if (!fields.fullName.trim()) newErrors.fullName = 'Required'
    if (!fields.phone.trim()) newErrors.phone = 'Required'
    if (!fields.email.trim()) newErrors.email = 'Required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSaving(true)
    try {
      await window.api.settings.save({ contactInfo: fields })
      onNext(fields)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        These details appear in the header of every generated resume.
      </Typography>
      <TextField
        label="Full name"
        value={fields.fullName}
        onChange={(e) => update('fullName', e.target.value)}
        error={!!errors.fullName}
        helperText={errors.fullName}
        fullWidth
        size="small"
        required
        inputRef={firstInputRef}
        disabled={saving}
      />
      <TextField
        label="Phone"
        value={fields.phone}
        onChange={(e) => update('phone', e.target.value)}
        error={!!errors.phone}
        helperText={errors.phone}
        fullWidth
        size="small"
        required
        disabled={saving}
      />
      <TextField
        label="Email"
        type="email"
        value={fields.email}
        onChange={(e) => update('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        size="small"
        required
        disabled={saving}
      />
      <TextField
        label="LinkedIn URL"
        value={fields.linkedin ?? ''}
        onChange={(e) => update('linkedin', e.target.value)}
        fullWidth
        size="small"
        disabled={saving}
      />
      <TextField
        label="GitHub URL"
        value={fields.github ?? ''}
        onChange={(e) => update('github', e.target.value)}
        fullWidth
        size="small"
        disabled={saving}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleNext}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? 'Saving…' : 'Next'}
        </Button>
      </Box>
    </Box>
  )
}

// ── Step 3 & 4: File Upload ───────────────────────────────────────────────────

interface StepUploadProps {
  docType: 'resume' | 'cover_letter'
  required: boolean
  onNext: () => void
  onSkip?: () => void
}

function StepUpload({ docType, required, onNext, onSkip }: StepUploadProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ingesting, setIngesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ingested, setIngested] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return

    const nativePath = window.api.getPathForFile(file)
    setIngesting(true)
    setError(null)
    setFileName(file.name)

    try {
      await window.api.docs.ingest(nativePath, docType)
      setIngested(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setFileName(null)
    } finally {
      setIngesting(false)
      // Reset input so the same file can be re-selected after an error.
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const label = docType === 'resume' ? 'resume or CV' : 'cover letter'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {docType === 'resume'
          ? 'Upload an existing resume or CV to populate your Master CV. PDF, DOCX, and plain text files are supported.'
          : 'Optionally upload an existing cover letter. It will be used to inform cover letter generation style.'}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {ingested && fileName ? (
        <Alert severity="success" sx={{ py: 0.5 }}>
          {fileName} ingested successfully.
        </Alert>
      ) : (
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={ingesting}
          startIcon={ingesting ? <CircularProgress size={16} /> : null}
          sx={{ alignSelf: 'flex-start' }}
        >
          {ingesting ? 'Processing…' : `Select ${label} file`}
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {error}
          {!ingested && (
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                setError(null)
                fileInputRef.current?.click()
              }}
            >
              Try again
            </Button>
          )}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {!required && onSkip && (
          <Button color="inherit" onClick={onSkip} disabled={ingesting}>
            Skip
          </Button>
        )}
        <Button
          variant="contained"
          disableElevation
          onClick={onNext}
          disabled={ingesting || (required && !ingested)}
        >
          {docType === 'cover_letter' ? 'Get Started' : 'Next'}
        </Button>
      </Box>
    </Box>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export default function OnboardingPage(): JSX.Element {
  const dispatch = useAppDispatch()
  const [activeStep, setActiveStep] = useState(0)

  function advance(): void {
    setActiveStep((s) => s + 1)
  }

  function handleContactInfoNext(info: ContactInfo): void {
    dispatch(setContactInfo(info))
    advance()
  }

  async function handleFinish(): Promise<void> {
    await window.api.settings.save({ onboardingComplete: true })
    dispatch(setOnboardingComplete(true))
  }

  function renderStep(): JSX.Element {
    switch (activeStep) {
      case 0:
        return <StepApiKey onSuccess={advance} />
      case 1:
        return <StepContactInfo onNext={handleContactInfoNext} />
      case 2:
        return <StepUpload docType="resume" required={true} onNext={advance} />
      case 3:
        return (
          <StepUpload
            docType="cover_letter"
            required={false}
            onNext={handleFinish}
            onSkip={handleFinish}
          />
        )
      default:
        return <></>
    }
  }

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
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
          <Typography id="onboarding-title" variant="h6" fontWeight={700} gutterBottom>
            Welcome to Job Application Kit
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
        <Box sx={{ px: 4, flex: 1, overflowY: 'auto', pb: 4 }}>{renderStep()}</Box>
      </Paper>
    </Box>
  )
}
