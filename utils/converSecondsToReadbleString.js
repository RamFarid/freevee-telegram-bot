function converSecondsToReadbleString(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let result = ''

  if (hours > 0) {
    result += hours + ' hour' + (hours > 1 ? 's' : '') + ' and '
  }

  if (minutes > 0) {
    result += minutes + ' minute' + (minutes > 1 ? 's' : '') + ' and '
  }

  result += remainingSeconds + ' second' + (remainingSeconds !== 1 ? 's' : '')

  return result
}

module.exports = converSecondsToReadbleString
