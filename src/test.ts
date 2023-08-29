import { getAgent, getPostsForIdentifier } from './GetPostData'

// Writing a test to pull in a users last post, spot checking accounts that failed to grab post data
async function getLastPost (): Promise<void> {
  const agent = await getAgent()
  const lastPost = await getPostsForIdentifier(agent, 'pixelatedboat.bsky.social', 1, '')
  console.log(lastPost.data.feed)
}

console.log('hello world')

if (typeof require !== 'undefined' && require.main === module) {
  // this is the main module
  void getLastPost()
}
