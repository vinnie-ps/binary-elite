
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envConfig: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=')
    if (key && values.length > 0) {
        envConfig[key.trim()] = values.join('=').trim()
    }
})

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log("Attempting to INSERT into 'posts' table...")

    const { data, error } = await supabase
        .from('posts')
        .insert({
            title: 'Diagnostic Post',
            content: 'This is a test post to verify table existence.',
            is_published: false
        })
        .select()

    if (error) {
        console.error('INSERT FAILED:', JSON.stringify(error, null, 2))
        if (error.code === '42P01') {
            console.log("CONCLUSION: Table 'posts' does NOT exist.")
        } else {
            console.log("CONCLUSION: Table exists but other error occurred (RLS?).")
        }
    } else {
        console.log('INSERT SUCCESS:', data)
        console.log("CONCLUSION: Table 'posts' exists and is writable.")

        // Clean up
        if (data && data[0]?.id) {
            await supabase.from('posts').delete().eq('id', data[0].id)
            console.log("Cleaned up test post.")
        }
    }
}

check()
