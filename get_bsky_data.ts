#!/usr/bin/env ts-node

import pkg from '@atproto/api';
const { BskyAgent } = pkg;
// import { logger } from "./logger.js";
import dotenv from 'dotenv';

dotenv.config();

const agent = new BskyAgent({
  service: 'https://bsky.social',
  // persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
  //   // store the session-data for reuse 
  // }
})

await agent.login({ identifier: process.env.IDENTIFIER!, password: process.env.PASSWORD! })
// await agent.post({ text: "test post" })

// pull in the last two weeks of tweets
// while posts are still from the last 2 weeks get 
var today = new Date();
const two_weeks_ago = new Date(new Date().setDate(today.getDate() - 14));
var min_ts = today;
console.log("Now:", today);
console.log("Two weeks ago:", two_weeks_ago);
var cursor = "";
var tweets: pkg.AppBskyFeedDefs.FeedViewPost[] = []
while (min_ts > two_weeks_ago) {
  console.log(cursor)
  const authorFeedParams = {
    actor: process.env.IDENTIFIER!,
    // limit?: number;
    cursor: cursor,
    // filter?: 'posts_with_replies' | 'posts_no_replies' | 'posts_with_media' | (string & {});
  }
  const res = await agent.getAuthorFeed(authorFeedParams);
  cursor = res.data.cursor!;
  const new_tweets = res['data']['feed'];
  new_tweets.forEach((element) => {
    const this_ts = get_op_post_ts(element);
    if (this_ts < min_ts) {
      min_ts = this_ts;
    }
    tweets.push(element);
  })  
  console.log(min_ts)
}

/**
 * 
 * @param feedViewPost - Feed post, can be an original post, reply or repost
 * @returns - the timestamp that the user made the post/repost
 */
function get_op_post_ts (feedViewPost: pkg.AppBskyFeedDefs.FeedViewPost): Date {
  var this_ts;
  if (feedViewPost.reason !== undefined) {
    this_ts = new Date(feedViewPost.reason.indexedAt as number)
  } else {
    this_ts = new Date((feedViewPost.post.record as pkg.AppBskyFeedPost.Record).createdAt)
  }
  return this_ts
}

// console.log(tweets))
console.log(tweets.length, "tweets found.")

