const https = require('https')

const md5 = require('./md5')

// Need to be filled out
const appKey = ''
// Need to be filled out
const secret = ''
const salt = 1

const interval = 0
let words = [] 
let triggered = false
let remainBuf = ''
let cnt = 1

process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
  let chunk = process.stdin.read()
  if (chunk !== null) {
    if (remainBuf) {
      chunk = remainBuf + chunk
    }
    if (!chunk.endsWith('\n')) {
      let offset = chunk.lastIndexOf('\n')
      remainBuf = chunk.slice(offset + 1)
      chunk = chunk.slice(0, offset + 1)
    }

    words = words.concat(chunk.split('\n').filter(w => w !== ''))

    if (!triggered) {
      triggered = true
      triggerNext()
    } 
  }
})

let triggerNext = (function () {
  let i = 0
  return function () {
    if (i >= words.length) process.exit(0)

    getData(words[i++], processDataCb)
  }
})()

function getData (word, cb) {
  word = word.trim()
  const sign = md5(appKey + word + salt + secret)

  const options = {
    hostname: 'openapi.youdao.com',
    port: 443,
    path: `/api?q=${word}&from=en&to=zh-CHS&appKey=${appKey}&salt=1&sign=${sign}`,
    method: 'GET'
  }

  const req = https.request(options, (res) => {
    let data =  ''
    res.on('data', (d) => {
      data += d
    })

    res.on('end', () => {
      data = data.toString('utf8')
      data = JSON.parse(data)

      cb(data)
    })
  })

  req.on('close', () => {
    setTimeout(triggerNext, interval)
  })

  req.on('error', (e) => {
    console.error('req err: ' + e)
  })

  req.end()
}

/*
 * example JSON object:
 * { tSpeakUrl: 'http://openapi.youdao.com/ttsapi?q=%E7%8C%AB&langType=zh-CHS&sign=33435BD941CCFA50EB490FC8E4B8C3D0&salt=1540286120196&voice=4&format=mp3&appKey=260d76ea9aaff3f2',
 *   web: 
 *    [ { value: [Array], key: 'CAT' },
 *      { value: [Array], key: 'JUNGLE CAT' },
 *      { value: [Array], key: 'PERSIAN CAT' } ],
 *   query: 'cat',
 *   translation: [ '猫' ],
 *   errorCode: '0',
 *   dict: { url: 'yddict://m.youdao.com/dict?le=eng&q=cat' },
 *   webdict: { url: 'http://m.youdao.com/dict?le=eng&q=cat' },
 *   basic: 
 *    { exam_type: [ '初中' ],
 *      'us-phonetic': 'kæt',
 *      phonetic: 'kæt',
 *      'uk-phonetic': 'kæt',
 *      'uk-speech': 'http://openapi.youdao.com/ttsapi?q=cat&langType=en&sign=025F3551DDB2C3D7D54261708D6CF05F&salt=1540286120196&voice=5&format=mp3&appKey=260d76ea9aaff3f2',
 *      explains: [ 'n. 猫，猫科动物' ],
 *      'us-speech': 'http://openapi.youdao.com/ttsapi?q=cat&langType=en&sign=025F3551DDB2C3D7D54261708D6CF05F&salt=1540286120196&voice=6&format=mp3&appKey=260d76ea9aaff3f2' },
 *   l: 'en2zh-CHS',
 *   speakUrl: 'http://openapi.youdao.com/ttsapi?q=cat&langType=en&sign=025F3551DDB2C3D7D54261708D6CF05F&salt=1540286120196&voice=4&format=mp3&appKey=260d76ea9aaff3f2' }
*/
function processDataCb (data) {
  if (!data) return
  
  if (data.query) {
    process.stdout.write(data.query)
    process.stdout.write('       ')
    process.stdout.write((cnt++).toString())
    process.stdout.write('\n')
  }
  if (data.basic) {
    if (data.basic.phonetic) {
      process.stdout.write(data.basic.phonetic)
      process.stdout.write('  ')
    }
    if (data.basic['us-phonetic']) {
      process.stdout.write(data.basic['us-phonetic'])
      process.stdout.write('  ')
    }
    if (data.basic['uk-phonetic']) {
      process.stdout.write(data.basic['uk-phonetic'])
      process.stdout.write('  ')
    }

    process.stdout.write('\n')
    if (data.basic.explains) {
      process.stdout.write('  ' + data.basic.explains + '\n')
    } else {
      console.error(data)
    }
  }
  process.stdout.write('\n')
}
