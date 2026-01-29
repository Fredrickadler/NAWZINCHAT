import { supabaseAdmin } from '../lib/supabase'

async function checkUsers() {
  console.log('Checking users in database...')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')

  try {
    // Check if users table exists and has data
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, avatar, createdAt')

    if (error) {
      console.error('Error fetching users:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found in database!')
      console.log('Run: npm run db:seed')
      return
    }

    console.log(`✅ Found ${users.length} user(s):`)
    users.forEach((user) => {
      console.log(`  - Username: ${user.username}, ID: ${user.id}`)
    })
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkUsers()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })

