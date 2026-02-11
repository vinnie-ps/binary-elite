import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface AccountActivatedEmailProps {
    memberName: string
}

export const AccountActivatedEmail = ({
    memberName,
}: AccountActivatedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your Binary Elite Account is Now Active! 🎉</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>🎉 Account Activated!</Heading>

                <Text style={text}>
                    Hi {memberName},
                </Text>

                <Text style={text}>
                    Great news! Your Binary Elite account has been <strong>activated</strong> and you now have full access to all member resources.
                </Text>

                <Section style={highlightBox}>
                    <Text style={highlightText}>
                        ✓ Full dashboard access<br />
                        ✓ Enroll in classes and workshops<br />
                        ✓ Access premium tools and resources<br />
                        ✓ Connect with the community
                    </Text>
                </Section>

                <Section style={buttonContainer}>
                    <Link
                        style={button}
                        href="https://yourdomain.com/dashboard"
                    >
                        Explore Your Dashboard
                    </Link>
                </Section>

                <Text style={text}>
                    We're excited to have you as an active member of Binary Elite. If you have any questions or need assistance, don't hesitate to reach out!
                </Text>

                <Text style={footer}>
                    Welcome aboard!<br />
                    The Binary Elite Team
                </Text>
            </Container>
        </Body>
    </Html>
)

export default AccountActivatedEmail

// Styles
const main = {
    backgroundColor: '#0f0f19',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    backgroundColor: '#1a1a2e',
    margin: '0 auto',
    padding: '40px 20px',
    borderRadius: '8px',
    maxWidth: '600px',
}

const h1 = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 20px',
    padding: '0',
}

const text = {
    color: '#e0e0e0',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
}

const highlightBox = {
    backgroundColor: '#16213e',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
}

const highlightText = {
    color: '#ffffff',
    fontSize: '16px',
    lineHeight: '28px',
    margin: '0',
}

const buttonContainer = {
    margin: '32px 0',
    textAlign: 'center' as const,
}

const button = {
    backgroundColor: '#10b981',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
}

const footer = {
    color: '#9ca3af',
    fontSize: '14px',
    lineHeight: '24px',
    marginTop: '32px',
}
