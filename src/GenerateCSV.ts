// For below to work, set "resolveJsonModule": true in tsconfig.json
import { type AppBskyFeedDefs } from '@atproto/api'
import { type FollowsData } from './GetFollowingData'
import postHistoryJson from '../data/post_history.json'
import followJson from '../data/follows.json'
import { getOPPostTs } from './GetPostData'
import fs from 'fs'
import Papa from 'papaparse'

const tweetData = postHistoryJson as AppBskyFeedDefs.FeedViewPost[]
const followsData = followJson as FollowsData[]
type AllowedDataTypes = (AppBskyFeedDefs.FeedViewPost[] | FollowsData[])

interface PostDataOutput {
  date: string
  time: string
  uri: string
  category: string
}

interface FollowsDataOutput {
  did: string
  handle: string
  displayName: string
  avatar: string
  followedDt: string
  lastPostUri: string
  lastPostDt: string
  followsBack: string
}

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

/**
 * Transform data and create a csv string of the tweet data
 * @param data Tweet data pulled from bsky
 * @returns csv string
 */
function postDataString (data: AppBskyFeedDefs.FeedViewPost[]): string {
  const output: PostDataOutput[] = []
  data.forEach(function (element: AppBskyFeedDefs.FeedViewPost) {
    const createdAtTs = getOPPostTs(element)
    const date = createdAtTs.toLocaleDateString()
    const time = createdAtTs.toLocaleTimeString()
    const uri = element.post.uri
    const category = getCategory(element)
    const row: PostDataOutput = { date, time, uri, category } 
    output.push(row)
  })
  const csvContent = Papa.unparse(output, { columns: ['date', 'time', 'uri', 'category'] })
  return csvContent
}

/**
 * Transform data and create a csv string of the follows data
 * @param data Follows data pulled from bsky
 * @returns csv string
 */
function followsDataString (data: FollowsData[]): string {
  const output: FollowsDataOutput[] = []
  data.forEach(function (element: FollowsData) {
    const did = element.did
    const handle = element.handle
    const displayName = element.displayName !== undefined ? element.displayName.trim() : '' // trim needed for rare \n ending name
    const avatar = element.avatar ?? ''
    const followedDt = element.createdAt !== undefined ? new Date(element.createdAt).toLocaleDateString() : ''
    const lastPostUri = element.lastPost !== undefined ? element.lastPost.post.uri : ''
    const lastPostDt = element.lastPost !== undefined ? getOPPostTs(element.lastPost).toLocaleDateString() : ''
    const followsBack = ((element.viewer?.followedBy !== undefined) && (element.viewer?.following !== undefined)) ? '1' : '0'
    const row: FollowsDataOutput = { did, handle, displayName, avatar, followedDt, lastPostUri, lastPostDt, followsBack }
    output.push(row)
  })
  const columns = ['did', 'handle', 'displayName', 'avatar', 'followedDt', 'lastPostUri', 'lastPostDt', 'followsBack']
  const csvContent = Papa.unparse(output, { columns })
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

GenerateCSV<AppBskyFeedDefs.FeedViewPost[]>(postDataString, 'data/post_history.csv', tweetData)
GenerateCSV<FollowsData[]>(followsDataString, 'data/follows.csv', followsData)
