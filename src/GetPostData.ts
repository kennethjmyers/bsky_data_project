#!/usr/bin/env ts-node
import { BskyAgent, type AppBskyFeedDefs, type AppBskyFeedPost } from '@atproto/api'
import { IDENTIFIER, PASSWORD } from './Utils'
import fs from 'fs'
// import { logger } from "./logger.js"

export async function getPostHistory (lookbackDays: number = 14): Promise<void> {
  const agent = new BskyAgent({
    service: 'https://bsky.social'
    // persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    //   // store the session-data for reuse
    // }
  })

  await agent.login({ identifier: IDENTIFIER, password: PASSWORD })
  // await agent.post({ text: "test post" })
  // get pass data
  const today = new Date()
  const startDate = new Date(new Date().setDate(today.getDate() - lookbackDays))
  let minTs = today
  console.log('Now:', today)
  console.log('Two weeks ago:', startDate)
  let cursor = ''
  const tweets: AppBskyFeedDefs.FeedViewPost[] = []
  while (minTs > startDate && cursor !== undefined) {
    console.log(cursor)
    const params = {
      actor: IDENTIFIER,
      limit: 100,
      cursor
      // filter?: 'posts_with_replies' | 'posts_no_replies' | 'posts_with_media' | (string & {});
    }
    const res = await agent.getAuthorFeed(params)
    cursor = res.data.cursor as string
    const newTweets = res.data.feed
    newTweets.forEach((element) => {
      const thisTs = getOPPostTs(element)
      if (thisTs < minTs) {
        minTs = thisTs
      }
      tweets.push(element)
    })
    console.log(minTs)
  }

  // console.log(tweets))
  console.log(tweets.length, 'tweets found.')

  // write  contents to file
  const outfile = 'data/post_history.json'
  fs.writeFile(outfile, JSON.stringify(tweets), function (err) {
    if (err != null) {
      console.log(err)
    }
  })
}

/**
 * This function helps with getting the timestamp from a post, which is located in a different spot if the post is a repost.
 *
 * @param feedViewPost - Feed post, can be an original post, reply or repost
 * @returns - the timestamp that the user made the post/repost
 */
export function getOPPostTs (feedViewPost: AppBskyFeedDefs.FeedViewPost): Date {
  let thisTs
  if (feedViewPost.reason !== undefined) {
    thisTs = new Date(feedViewPost.reason.indexedAt as number)
  } else {
    thisTs = new Date((feedViewPost.post.record as AppBskyFeedPost.Record).createdAt)
  }
  return thisTs
}

if (typeof require !== 'undefined' && require.main === module) {
  // this is the main module
  void getPostHistory(120)
}
