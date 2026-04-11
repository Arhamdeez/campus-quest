/** Display name for leaderboard: avoid showing roll-number-like identifiers. */
export function normalizeLeaderboardName(rawName, uid) {
  const trimmed = String(rawName || '').trim()
  const hasLetters = /[a-z]/i.test(trimmed)
  const isNumericOnly = /^\d+$/.test(trimmed)
  const digitsCount = (trimmed.match(/\d/g) || []).length
  const lettersCount = (trimmed.match(/[a-z]/gi) || []).length
  const hasSpace = /\s/.test(trimmed)
  const looksLikeRollId =
    (!hasSpace && digitsCount >= 5 && lettersCount <= 3) ||
    (trimmed.length > 0 && digitsCount / trimmed.length >= 0.6)

  if (!trimmed || isNumericOnly || !hasLetters || looksLikeRollId) {
    return `Student ${String(uid || '').slice(0, 4).toUpperCase()}`
  }
  return trimmed
}
