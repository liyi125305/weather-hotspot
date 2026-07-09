import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })
import axios from 'axios'

const API_KEY = process.env.QWEATHER_API_KEY
const API_HOST = process.env.QWEATHER_API_HOST

const url = `https://${API_HOST}/v7/warning/now?location=101010100&key=${API_KEY}`
const res = await axios.get(url, { timeout: 10000 })
console.log('Code:', res.data.code)
const w = res.data.warning?.[0]
if (w) {
  console.log('Warning[0] 字段:')
  Object.keys(w).forEach(k => {
    console.log(`  ${k}: ${JSON.stringify(w[k])}`)
  })
}
