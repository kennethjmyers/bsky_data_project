#!/usr/bin/env ts-node
import dotenv from 'dotenv'

dotenv.config()
if (process.env.IDENTIFIER === undefined) { throw new Error('.env IDENTIFIER not found') }
if (process.env.PASSWORD === undefined) { throw new Error('.env PASSWORD not found') }

export const IDENTIFIER = process.env.IDENTIFIER
export const PASSWORD = process.env.PASSWORD
