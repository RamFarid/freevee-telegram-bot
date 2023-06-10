function formatNumber(number) {
  const reversedNumber = String(number).split('').reverse().join('')
  const formattedNumber = reversedNumber.match(/.{1,3}/g).join(',')
  return formattedNumber.split('').reverse().join('')
}

module.exports = formatNumber
