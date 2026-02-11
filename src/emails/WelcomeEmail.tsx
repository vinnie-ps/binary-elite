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

interface WelcomeEmailProps {
    memberName: string
    memberEmail: string
    isActive: boolean
}

export const WelcomeEmail = ({
    memberName,
    memberEmail,
    isActive,
}: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Welcome to Binary Elite - Your Journey Begins!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Welcome to Binary Elite! 🚀</Heading>

                <Text style={text}>
                    Hi {memberName},
                </Text>

                <Text style={text}>
                    Thank you for joining Binary Elite! We're excited to have you as part of our community.
                </Text>

                {isActive ? (
                    <>
                        <Text style={text}>
                            Your account is now <strong>active</strong> and you have full access to all member resources.
                        </Text>

                        <Section style={buttonContainer}>
                            <Link
                                style={button}
                                href="https://yourdomain.com/dashboard"
                            >
                                Go to Dashboard
                            </Link>
                        </Section>
                    </>
                ) : (
                    <Text style={text}>
                        Your account is currently under review. You'll receive a confirmation email once your account is activated. In the meantime, feel free to explore your dashboard.
                    </Text>
                )}

                <Text style={text}>
                    <strong>What's Next?</strong>
                </Text>

                <Text style={text}>
                    • Complete your profile<br />
                    • Explore available classes and workshops<br />
                    • Check out our tools and resources<br />
                    • Connect with other members
                </Text>

                <Text style={text}>
                    If you have any questions, feel free to reach out to us anytime.
                </Text>

                <Text style={footer}>
                    Best regards,<br />
                    The Binary Elite Team
                </Text>
            </Container>
        </Body>
    </Html>
)

export default WelcomeEmail

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

const buttonContainer = {
    margin: '32px 0',
    textAlign: 'center' as const,
}

const button = {
    backgroundColor: '#3b82f6',
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
