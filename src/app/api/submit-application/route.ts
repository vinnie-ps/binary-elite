import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json()

        const supabase = await createClient()

        // Insert application into database
        const { data, error } = await supabase
            .from('applications')
            .insert([
                {
                    name,
                    email,
                    message,
                    status: 'pending',
                },
            ])
            .select()
            .single()

        if (error) {
            console.error('Error creating application:', error)
            return NextResponse.json(
                { error: 'Failed to submit application' },
                { status: 500 }
            )
        }

        // Send admin notification email
        try {
            await fetch(`${request.headers.get('origin')}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'application',
                    data: {
                        name,
                        email,
                        message,
                        id: data.id,
                    },
                }),
            })
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError)
            // Don't fail the application submission if email fails
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Application submission error:', error)
        return NextResponse.json(
            { error: 'Failed to process application' },
            { status: 500 }
        )
    }
}
