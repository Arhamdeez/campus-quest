import { useMemo, useState } from 'react'
import Header from '../components/Header'

function LoginPage({ mode = 'login', onLogin, onSignup, error }) {
  const [localMode, setLocalMode] = useState(mode)
  const [submitting, setSubmitting] = useState(false)
  const title = useMemo(() => (localMode === 'signup' ? 'Create account' : 'Welcome back'), [localMode])
  const subtitle = useMemo(
    () => (localMode === 'signup' ? 'Create a free account to save your progress' : 'Log in to access your dashboard'),
    [localMode],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formEl = event.currentTarget
    const formData = new FormData(formEl)
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')
    const fullName = localMode === 'signup' ? String(formData.get('name') || '').trim() : ''

    setSubmitting(true)
    try {
      if (localMode === 'signup') await onSignup?.({ email, password, name: fullName })
      else await onLogin?.({ email, password })
      formEl?.reset?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header icon="🔐" title={title} subtitle={subtitle} />
      <section className="card panel auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-tab ${localMode === 'login' ? 'active' : ''}`}
            onClick={() => setLocalMode('login')}
            role="tab"
            aria-selected={localMode === 'login'}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${localMode === 'signup' ? 'active' : ''}`}
            onClick={() => setLocalMode('signup')}
            role="tab"
            aria-selected={localMode === 'signup'}
          >
            Sign up
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {localMode === 'signup' ? (
            <input
              name="name"
              type="text"
              placeholder="Full name (as on campus ID)"
              required
              autoComplete="name"
            />
          ) : null}
          <input name="email" type="email" placeholder="Email" required autoComplete="email" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete={localMode === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
          />
          {error ? <small className="error-text">{error}</small> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : localMode === 'signup' ? 'Create account' : 'Login'}
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true" />
        <p className="auth-footnote">By continuing, you agree to our terms of use.</p>
      </section>
    </>
  )
}

export default LoginPage

