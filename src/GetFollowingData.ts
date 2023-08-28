#!/usr/bin/env ts-node
import { BskyAgent, type AppBskyActorDefs } from '@atproto/api'
import { IDENTIFIER, PASSWORD } from './Utils'
import fs from 'fs/promises'
// import { logger } from "./logger.js"

export async function getFollowing (): Promise<void> {
  const agent = new BskyAgent({
    service: 'https://bsky.social'
    // persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    //   // store the session-data for reuse
    // }
  })
  await agent.login({ identifier: IDENTIFIER, password: PASSWORD })
  let cursor = ''
  const jsonData: AppBskyActorDefs.ProfileView[] = []
  while (cursor !== undefined) {
    console.log(cursor)
    const params = {
      actor: IDENTIFIER,
      limit: 100,
      cursor
    }
    const res = await agent.getFollows(params)
    cursor = res.data.cursor as string
    const follows = res.data.follows
    // for each user get their latest tweet
    follows.forEach((f) => {
      const thisDID = f.did
      const params = { actor: thisDID, limit: 1 }
      void agent.getAuthorFeed(params).then((res) => {
        f.lastPost = res
      })
      // build a new object out of select follow data and their most recent tweet
      jsonData.push(f)
    })
    console.log(res)
  }
  console.log(jsonData.length, 'follows found.')

  // write  contents to file
  const outfile = 'data/follows.json'
  await fs.writeFile(outfile, JSON.stringify(jsonData)).then(() => {
    console.log('write successful')
  }).catch(err => {
    console.error(err)
  })
}

if (typeof require !== 'undefined' && require.main === module) {
  // this is the main module
  void getFollowing()
}
