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

interface ApplicationReceivedEmailProps {
    applicantName: string
    applicantEmail: string
    message: string
    applicationId: string
}

export const ApplicationReceivedEmail = ({
    applicantName,
    applicantEmail,
    message,
    applicationId,
}: ApplicationReceivedEmailProps) => (
    <Html>
        <Head />
        <Preview>New Application Received - {applicantName}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>🔔 New Application Received</Heading>

                <Text style={text}>
                    A new member application has been submitted and is awaiting your review.
                </Text>

                <Section style={infoBox}>
                    <Text style={infoLabel}>Applicant Name:</Text>
                    <Text style={infoValue}>{applicantName}</Text>

                    <Text style={infoLabel}>Email:</Text>
                    <Text style={infoValue}>{applicantEmail}</Text>

                    <Text style={infoLabel}>Message:</Text>
                    <Text style={messageText}>{message}</Text>
                </Section>

                <Section style={buttonContainer}>
                    <Link
                        style={button}
                        href={`https://yourdomain.com/admin/applications`}
                    >
                        Review Application
                    </Link>
                </Section>

                <Text style={footer}>
                    Binary Elite Admin System
                </Text>
            </Container>
        </Body>
    </Html>
)

export default ApplicationReceivedEmail

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

const infoBox = {
    backgroundColor: '#16213e',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
}

const infoLabel = {
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '12px 0 4px',
}

const infoValue = {
    color: '#ffffff',
    fontSize: '16px',
    margin: '0 0 12px',
}

const messageText = {
    color: '#e0e0e0',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0',
    whiteSpace: 'pre-wrap' as const,
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
    textAlign: 'center' as const,
}
