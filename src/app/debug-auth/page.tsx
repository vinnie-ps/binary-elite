import { createClient } from '@/lib/supabase/server'

export default async function DebugAuthPage() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    let profile = null
    let profileError = null

    if (user) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        profile = data
        profileError = error
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4">Auth Debugger</h1>

            <div className="space-y-6">
                <section className="border p-4 rounded bg-gray-900">
                    <h2 className="text-xl mb-2 text-blue-400">User Session</h2>
                    {user ? (
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
                    ) : (
                        <div className="text-red-500">No User Session Found ({userError?.message})</div>
                    )}
                </section>

                <section className="border p-4 rounded bg-gray-900">
                    <h2 className="text-xl mb-2 text-green-400">Profile Data</h2>
                    {profile ? (
                        <div className="space-y-2">
                            <p><strong>ID:</strong> {profile.id}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Role:</strong> <span className="bg-white text-black px-1">{profile.role}</span></p>
                            <p><strong>Status:</strong> {profile.status}</p>
                            <details>
                                <summary className="cursor-pointer text-gray-500">Full Dump</summary>
                                <pre className="text-xs mt-2">{JSON.stringify(profile, null, 2)}</pre>
                            </details>
                        </div>
                    ) : (
                        <div className="text-red-500">
                            No Profile Found (Error: {profileError?.message || 'None'})
                        </div>
                    )}
                </section>

                <section className="border p-4 rounded bg-gray-900">
                    <h2 className="text-xl mb-2 text-yellow-400">Diagnosis</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Is Admin?</strong>
                            {profile?.role === 'admin' ?
                                <span className="text-green-500 ml-2">YES</span> :
                                <span className="text-red-500 ml-2">NO (Role is '{profile?.role}')</span>
                            }
                        </li>
                        <li>
                            <strong>RLS Check:</strong>
                            {profile ?
                                <span className="text-green-500 ml-2">READ SUCCESS</span> :
                                <span className="text-red-500 ml-2">READ FAILED (Check RLS Policies)</span>
                            }
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
