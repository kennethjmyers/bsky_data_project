// For below to work, set "resolveJsonModule": true in tsconfig.json
import { type AppBskyFeedDefs } from '@atproto/api'
import postHistoryObj from '../data/post_history.json'
import { getOPPostTs } from './GetPostData'
import fs from 'fs'

const tweetData = postHistoryObj as AppBskyFeedDefs.FeedViewPost[]

function isRepost (element: AppBskyFeedDefs.FeedViewPost): boolean {
  if ((element.reason != null) && (element.reason.$type as string).includes('#reasonRepost', 17)) {
    return true
  } else {
    return false
  }
}

function isReply (element: AppBskyFeedDefs.FeedViewPost): boolean {
  if (element.reply != null) {
    return true
  } else {
    return false
  }
}

function getCategory (element: AppBskyFeedDefs.FeedViewPost): string {
  if (isRepost(element)) {
    return 'repost'
  } else if (isReply(element)) {
    return 'reply'
  } else {
    return 'original post'
  }
}

let csvContent = 'date,time,uri,category\n' // header
// Transform data and create a csv of the tweet data
tweetData.forEach(function (element: AppBskyFeedDefs.FeedViewPost) {
  const createdAtTs = getOPPostTs(element)
  const date = createdAtTs.toLocaleDateString()
  const time = createdAtTs.toLocaleTimeString()
  const uri = element.post.uri
  const category = getCategory(element)
  const thisRow = [date, time, uri, category].join(',') + '\n'
  csvContent += thisRow
})

// console.log(csv_content)
const writeStream = fs.createWriteStream('data/post_history.csv')
writeStream.write(csvContent)
writeStream.end()
