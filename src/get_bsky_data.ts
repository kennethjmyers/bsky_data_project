#!/usr/bin/env ts-node

import { BskyAgent, AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api'
// import { logger } from "./logger.js";
import dotenv from 'dotenv';
import fs from 'fs';


export async function get_post_history(lookback_days: number = 14) {
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
  const two_weeks_ago = new Date(new Date().setDate(today.getDate() - lookback_days));
  var min_ts = today;
  console.log("Now:", today);
  console.log("Two weeks ago:", two_weeks_ago);
  var cursor = "";
  var tweets: AppBskyFeedDefs.FeedViewPost[] = []
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

  // console.log(tweets))
  console.log(tweets.length, "tweets found.")

  // write  contents to file
  var outfile = `data/last_${lookback_days}_days_posts.json`
  fs.writeFile(outfile, JSON.stringify(tweets), function(err) {
    if (err) {
        console.log(err);
    }
  });
}


/**
 * 
 * @param feedViewPost - Feed post, can be an original post, reply or repost
 * @returns - the timestamp that the user made the post/repost
 */
export function get_op_post_ts (feedViewPost: AppBskyFeedDefs.FeedViewPost): Date {
  var this_ts;
  if (feedViewPost.reason !== undefined) {
    this_ts = new Date(feedViewPost.reason.indexedAt as number)
  } else {
    this_ts = new Date((feedViewPost.post.record as AppBskyFeedPost.Record).createdAt)
  }
  return this_ts
}

if (typeof module !== 'undefined' && !module.parent) {
  // this is the main module
  get_post_history()
}
