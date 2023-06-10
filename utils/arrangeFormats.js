function arrangeFormats(formats, link) {
  let videoAndAudio = []
  let audio = []
  let video = []
  video = formats.filter((video) => !video.hasAudio && video.hasVideo)
  audio = formats.filter((video) => video.hasAudio && !video.hasVideo)
  videoAndAudio = formats.filter((video) => video.hasAudio && video.hasVideo)
  const arrangedFormats = videoAndAudio.concat(audio).concat(video)
  return arrangedFormats
}
module.exports = arrangeFormats
