import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export interface JWTPayload {
  userId: string
  username: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar, lastSeen')
    .eq('id', payload.userId)
    .single()

  if (error || !user) {
    return null
  }

  return user
}

