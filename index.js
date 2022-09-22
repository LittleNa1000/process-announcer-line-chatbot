const line = require('@line/bot-sdk')
const app = require('express')
const axios = require('axios').default
const dotenv = require('dotenv')

const env = dotenv.config().parsed