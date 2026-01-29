import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Accept any username/password for testing
    const loginUsername = username || 'Guest'
    
    // Try to find user by username, or create a new one
    let { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', loginUsername)
      .single()

    // If user doesn't exist, create a new one
    if (fetchError || !user) {
      // Generate a unique ID
      const userId = randomUUID()
      
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          username: loginUsername,
          password: 'no-password-check', // No password check for testing
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(loginUsername)}`,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { 
            error: 'Failed to create user',
            details: createError.message,
            code: createError.code
          },
          { status: 500 }
        )
      }

      if (!newUser) {
        return NextResponse.json(
          { error: 'Failed to create user - no data returned' },
          { status: 500 }
        )
      }

      user = newUser
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
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

