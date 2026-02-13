const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ffocdpbpdfrpthrxuwwa.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmb2NkcGJwZGZycHRocnh1d3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDQ4NDUsImV4cCI6MjA4NTYyMDg0NX0.Ui7AmzLcMr-g0ok8mzp4lFceO4mQxGKEdcxr7AKiRlk';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmb2NkcGJwZGZycHRocnh1d3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA0NDg0NSwiZXhwIjoyMDg1NjIwODQ1fQ.os-ZOCsQd0m2NAn24Rv-SHzrorYGuIBjERpYOt2pI_8';

async function testQuery(key, label) {
    console.log(`\nTesting with ${label}:`);
    const supabase = createClient(supabaseUrl, key);

    // Exact query from MemberGallery
    const { data, error } = await supabase
        .from('featured_members')
        .select(`
            *,
            profiles!inner(full_name, email, portfolio_images)
        `)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', data.length);
        if (data.length > 0) {
            console.log('Sample result:', JSON.stringify(data[0], null, 2));
        }
    }

    // Direct profile check
    const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, is_featured')
        .eq('is_featured', true);

    if (profileError) {
        console.error('Profile Check Error:', profileError);
    } else {
        console.log('Public Profiles Count:', profileCheck.length);
        profileCheck.forEach(p => console.log(`- Profile ID: ${p.id}, Full Name: ${p.full_name}, is_featured: ${p.is_featured}`));
    }
}

async function run() {
    await testQuery(anonKey, 'Anon Key (Public)');
    await testQuery(serviceKey, 'Service Role Key (Bypass RLS)');
}

run();
