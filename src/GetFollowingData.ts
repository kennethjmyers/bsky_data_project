#!/usr/bin/env ts-node
import { BskyAgent, type AppBskyActorDefs, type AppBskyFeedDefs, type AppBskyFeedGetAuthorFeed, type AppBskyActorGetProfiles } from '@atproto/api'
import { IDENTIFIER, PASSWORD } from './Utils'
import { getPostsForIdentifier } from './GetPostData'
import fs from 'fs/promises'
import { json } from 'stream/consumers'
// import { logger } from "./logger.js"

export interface FollowsData extends AppBskyActorDefs.ProfileViewDetailed { createdAt: string, lastPost: AppBskyFeedDefs.FeedViewPost }

// https://stackoverflow.com/questions/46632327/iterate-through-an-array-in-blocks-of-50-items-at-a-time-in-node-js
function chunkArray<T> (array: T[], chunkSize: number): T[][] {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)
  )
}

async function getProfileViews (agent: BskyAgent, actors: string[]): Promise<AppBskyActorDefs.ProfileViewDetailed[]> {
  let profileViews: AppBskyActorDefs.ProfileViewDetailed[] = []
  const cleanedActors: string[] = []
  const chunks = chunkArray(actors, 25)
  for (const chunk of chunks) {
    const pv = await agent.getProfiles({ actors: chunk })
    profileViews = profileViews.concat(pv.data.profiles)
    // sometimes a profile view is silently not found
    const foundDids = pv.data.profiles.map((p) => { return p.did })
    chunk.forEach((v, i) => { foundDids.includes(v) ? cleanedActors.push(v) : console.log(v, ' not found') })
  }
  return profileViews
}

export async function getFollowing (): Promise<FollowsData[]> {
  const agent = new BskyAgent({
    service: 'https://bsky.social'
    // persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    //   // store the session-data for reuse
    // }
  })
  await agent.login({ identifier: IDENTIFIER, password: PASSWORD })
  let cursor = ''
  const jsonData = []
  while (cursor !== undefined) {
    console.log('Cursor: ', cursor)
    const params = {
      repo: IDENTIFIER,
      limit: 100,
      collection: 'app.bsky.graph.follow',
      cursor
    }
    const res = await agent.com.atproto.repo.listRecords(params)
    // const res = await agent.getFollows(params)
    cursor = res.data.cursor as string
    const follows = res.data.records
    const actors: string[] = []
    const createdAtsMap = new Map<string, string>()
    follows.forEach((f) => {
      const value = f.value as { createdAt: string, subject: string }
      createdAtsMap.set(value.subject, value.createdAt)
      actors.push(value.subject)
    })
    const profileViews = await getProfileViews(agent, actors)
    // get createdAts
    const createdAts = profileViews.map((pv) => { return createdAtsMap.get(pv.did) })
    // for each user get their latest tweet
    const thisJsonData = profileViews.map(async (f, i) => {
      // build a new object out of select follow data and their most recent tweet
      f.createdAt = createdAts[i]
      const thisDID = f.did
      const res = await getPostsForIdentifier(agent, thisDID, 1, '')
      f.lastPost = res.data.feed[0]
      return f as FollowsData
    })
    jsonData.push(thisJsonData)
  }
  const flatJsonData = await Promise.all(jsonData.flat())
  console.log(flatJsonData.length, 'follows found.')
  return flatJsonData
}

async function writeJson(jsonData: AppBskyActorDefs.ProfileView[]): Promise<void> {
  // write  contents to file
  const outfile = 'src/data/follows.json'
  await fs.writeFile(outfile, JSON.stringify(jsonData)).then(() => {
    console.log('write successful')
  }).catch(err => {
    console.error(err)
  })
}

async function getAndWriteJson(): Promise<void> {
  const jsonData = await getFollowing()
  void writeJson(jsonData)
}

if (typeof require !== 'undefined' && require.main === module) {
  // this is the main module
  void getAndWriteJson()
}
