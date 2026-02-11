'use client'

interface FooterProps {
    text: string
}

export default function Footer({ text }: FooterProps) {
    return (
        <footer className="relative py-16 px-8 border-t border-[rgba(59,130,246,0.1)]">
            <div className="max-w-6xl mx-auto text-center">
                {/* Footer Logo */}
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 rounded-2xl md:rounded-3xl border-2 border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)] backdrop-blur-[10px]"
                    style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}>
                    <div className="font-serif text-5xl md:text-6xl font-bold text-[var(--color-accent-blue)]"
                        style={{ textShadow: '0 0 15px var(--color-accent-blue-glow)' }}>
                        BE
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-[var(--color-text-muted)] text-sm">
                    {text}
                </p>
            </div>
        </footer>
    )
}
