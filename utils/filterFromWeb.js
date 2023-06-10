function filterAndGroupFormats(formats, message) {
  const groupedFormats = []
  let currentGroup = []

  formats.forEach((format) => {
    if (format.container === 'webm') {
      // Skip objects with format.container === "webp"
      return
    }

    const formatObj = {
      text: `${format.container || ''} ${
        format.qualityLabel || format.quality
      } ${
        !format.hasAudio && format.hasVideo
          ? '🔇'
          : format.hasAudio && !format.hasVideo
          ? '🔉'
          : ''
      }`,
      callback_data: JSON.stringify({
        itag: format.itag.toString(),
        videoLink: message,
      }),
    }

    currentGroup.push(formatObj)

    if (currentGroup.length === 2) {
      groupedFormats.push(currentGroup)
      currentGroup = []
    }
  })

  // Add any remaining format object as a single-element group
  if (currentGroup.length > 0) {
    groupedFormats.push(currentGroup)
  }

  return groupedFormats
}

module.exports = filterAndGroupFormats
