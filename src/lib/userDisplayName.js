/**
 * Prefer Realtime DB profile name, then Firebase Auth display name, then email local part.
 */
export function resolveUserDisplayName(user, profile) {
  const fromProfile = typeof profile?.name === 'string' ? profile.name.trim() : ''
  if (fromProfile) return fromProfile
  const fromAuth = typeof user?.displayName === 'string' ? user.displayName.trim() : ''
  if (fromAuth) return fromAuth
  const email = user?.email || ''
  const local = email.split('@')[0]
  return local || 'Student'
}
