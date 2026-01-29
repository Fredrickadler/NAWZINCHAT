import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('User not found:', username)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last seen
    await supabaseAdmin
      .from('users')
      .update({ lastSeen: new Date().toISOString() })
      .eq('id', user.id)

    const token = generateToken({
      userId: user.id,
      username: user.username,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

