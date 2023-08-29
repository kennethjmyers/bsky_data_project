// For below to work, set "resolveJsonModule": true in tsconfig.json
import { type AppBskyFeedDefs } from '@atproto/api'
import { type FollowsData } from './GetFollowingData'
import postHistoryJson from '../data/post_history.json'
import followJson from '../data/follows.json'
import { getOPPostTs } from './GetPostData'
import fs from 'fs'

const tweetData = postHistoryJson as AppBskyFeedDefs.FeedViewPost[]
const followsData = followJson as FollowsData[]
type AllowedDataTypes = (AppBskyFeedDefs.FeedViewPost[] | FollowsData[])


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

function postDataString (data: AppBskyFeedDefs.FeedViewPost[]): string {
  let csvContent = 'date,time,uri,category\n' // header
  // Transform data and create a csv of the tweet data
  data.forEach(function (element: AppBskyFeedDefs.FeedViewPost) {
    const createdAtTs = getOPPostTs(element)
    const date = createdAtTs.toLocaleDateString()
    const time = createdAtTs.toLocaleTimeString()
    const uri = element.post.uri
    const category = getCategory(element)
    const thisRow = [date, time, uri, category].join(',') + '\n'
    csvContent += thisRow
  })
  return csvContent
}

function followsDataString (data: FollowsData[]): string {
  let csvContent = 'did,handle,displayName,avatar,followDt,lastPostUri,lastPostDt\n' // header
  data.forEach(function (element: FollowsData) {
    const did = element.did
    const handle = element.handle
    const displayName = element.displayName
    const avatar = element.avatar
    const followedDt = element.indexedAt
    const lastPostUri = element.lastPost !== undefined ? element.lastPost.post.uri : ''
    const lastPostDt = element.lastPost !== undefined ? getOPPostTs(element.lastPost).toString() : ''
    const thisRow = [did, handle, displayName, avatar, followedDt, lastPostUri, lastPostDt].join(',') + '\n'
    csvContent += thisRow
  })
  return csvContent
}

/**
 * This function generates and CSV string and writes that to a file location.
 * @param stringFunc the function that generates the csv str
 * @param outfile the output file name
 */
export function GenerateCSV<T extends AllowedDataTypes> (stringFunc: (data: T) => string, outfile: string, data: T): void {
  const csvContent = stringFunc(data)
  // console.log(csv_content)
  const writeStream = fs.createWriteStream(outfile)
  writeStream.write(csvContent)
  writeStream.end()
}

// GenerateCSV<AppBskyFeedDefs.FeedViewPost[]>(postDataString, 'data/post_history.csv', tweetData)
GenerateCSV<FollowsData[]>(followsDataString, 'data/follows.csv', followsData)
