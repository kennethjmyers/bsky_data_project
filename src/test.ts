import { getAgent, getPostsForIdentifier } from './GetPostData'

// Writing a test to pull in a users last post, spot checking accounts that failed to grab post data
async function getLastPost (name: string): Promise<void> {
  const agent = await getAgent()
  const lastPost = await getPostsForIdentifier(agent, name, 1, '')
  console.log(lastPost.data.feed)
}

async function getProfile (): Promise<void> {
  const agent = await getAgent()
  const profileView = await agent.getProfile({actor: 'did:plc:6q4g7rfbwk3laisd6rxxuc2e'})
  console.log(profileView.data)
}

async function testQuery (): Promise<void> {
  const agent = await getAgent()
  const res = await agent.com.atproto.repo.listRecords({repo: 'did:plc:y4ba5uzamlb33dlqumtyaar2', collection: 'app.bsky.graph.follow'})
  console.log(res)
}

console.log('hello world')

if (typeof require !== 'undefined' && require.main === module) {
  // this is the main module
  void getLastPost('bonerwizard.bsky.social')
  // void testQuery()
  // void getProfile()
}
