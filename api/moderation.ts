/**
 * Vercel serverless function: /api/moderation
 *
 * GET  /api/moderation          -- returns { flagged: string[] } (markee contract addresses)
 * POST /api/moderation          -- flag or unflag a markee (admin wallet + signature required)
 *
 * Admin addresses are checked case-insensitively.
 * Signatures use the format: markee-moderation:{action}:8453:{markeeId}:{timestamp}
 * Timestamps older than 5 minutes are rejected.
 *
 * Required Vercel env vars: KV_REST_API_URL, KV_REST_API_TOKEN
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'
import { ethers } from 'ethers'

const KV_KEY = 'honeyswap:moderation:flagged'
const CHAIN_ID = 8453

const ADMIN_ADDRESSES = [
  '0x809C9f8dd8CA93A41c3adca4972Fa234C28F7714',
  '0x07AD02e0C1FA0b09fC945ff197E18e9C256838c6',
  '0x2F9e113434aeBDd70bB99cB6505e1F726C578D6d',
  '0xa25211B64D041F690C0c818183E32f28ba9647Dd',
]

function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.some(a => a.toLowerCase() === address.toLowerCase())
}

function corsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'GET') {
    try {
      const flagged = await kv.smembers(KV_KEY)
      return res.json({ flagged: flagged ?? [] })
    } catch {
      return res.json({ flagged: [] })
    }
  }

  if (req.method === 'POST') {
    const { markeeId, action, adminAddress, signature, timestamp } = req.body ?? {}

    if (!markeeId || !action || !adminAddress || !signature || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (action !== 'flag' && action !== 'unflag') {
      return res.status(400).json({ error: 'action must be flag or unflag' })
    }

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - Number(timestamp)) > 300) {
      return res.status(401).json({ error: 'Signature expired' })
    }

    const message = `markee-moderation:${action}:${CHAIN_ID}:${markeeId}:${timestamp}`
    let recovered: string
    try {
      recovered = ethers.utils.verifyMessage(message, signature)
    } catch {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    if (recovered.toLowerCase() !== adminAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Signature mismatch' })
    }

    if (!isAdmin(adminAddress)) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const id = markeeId.toLowerCase()
    if (action === 'flag') {
      await kv.sadd(KV_KEY, id)
    } else {
      await kv.srem(KV_KEY, id)
    }

    const flagged = await kv.smembers(KV_KEY)
    return res.json({ success: true, action, flagged: flagged ?? [] })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
