// For below to work, set "resolveJsonModule": true in tsconfig.json
const tweet_data = require(`../data/post_history.json`);
import { get_op_post_ts } from './get_bsky_data';
import { AppBskyFeedDefs } from '@atproto/api';
import fs from 'fs'
// console.log(tweet_data);


function isRepost (element: AppBskyFeedDefs.FeedViewPost) {
  if (element.reason && (element.reason.$type as string).includes("#reasonRepost", 17) ) {
    return true
  } else {
    return false
  }
}

var csv_content = 'date,time,uri,repost\n'  // header
// Transform data and create a csv of the tweet data
tweet_data.forEach(function (element: AppBskyFeedDefs.FeedViewPost) {
  var createdAt_ts = get_op_post_ts(element)
  var date = createdAt_ts.toLocaleDateString()
  var time = createdAt_ts.toLocaleTimeString()
  var uri = element.post.uri
  var repost = isRepost(element)
  var this_row = [date, time, uri, repost].join(',')+'\n'
  csv_content += this_row
});

// console.log(csv_content)
let writeStream = fs.createWriteStream(`data/post_history.csv`)
writeStream.write(csv_content)
writeStream.end()


// Original way I wrote this before realizing you could import json directly
// import fs from 'fs'
// const path = "data/last_two_weeks_tweets.json"
// var tweet_data
// function readPosts(path: string): string {
//   var data: string;
//   try {
//     data = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
//     console.log('here');
//   } catch (err) {
//     console.log(err);
//     throw err
//   }
//   return data
// }
// tweet_data = readPosts(path);



