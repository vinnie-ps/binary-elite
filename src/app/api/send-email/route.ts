import { resend, FROM_EMAIL, ADMIN_EMAIL } from '@/lib/email/client'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { ApplicationReceivedEmail } from '@/emails/ApplicationReceivedEmail'
import { AccountActivatedEmail } from '@/emails/AccountActivatedEmail'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { type, data } = await request.json()

        switch (type) {
            case 'welcome':
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: data.email,
                    subject: 'Welcome to Binary Elite!',
                    react: WelcomeEmail({
                        memberName: data.name,
                        memberEmail: data.email,
                        isActive: data.isActive || false,
                    }),
                })
                break

            case 'application':
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: ADMIN_EMAIL,
                    subject: `New Application: ${data.name}`,
                    react: ApplicationReceivedEmail({
                        applicantName: data.name,
                        applicantEmail: data.email,
                        message: data.message,
                        applicationId: data.id,
                    }),
                })
                break

            case 'activated':
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: data.email,
                    subject: 'Your Binary Elite Account is Now Active!',
                    react: AccountActivatedEmail({
                        memberName: data.name,
                    }),
                })
                break

            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email sending error:', error)
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        )
    }
}
