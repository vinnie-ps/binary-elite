'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
    const starsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!starsRef.current) return

        const starsContainer = starsRef.current
        const starCount = 150

        // Create stars
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div')
            star.className = 'absolute rounded-full bg-white/80 animate-twinkle'

            // Random position
            star.style.left = Math.random() * 100 + '%'
            star.style.top = Math.random() * 100 + '%'

            // Random size
            const size = Math.random() * 2 + 0.5
            star.style.width = size + 'px'
            star.style.height = size + 'px'

            // Random animation duration
            const duration = Math.random() * 6 + 4
            star.style.setProperty('--duration', duration + 's')

            // Random delay
            star.style.animationDelay = Math.random() * 5 + 's'

            starsContainer.appendChild(star)
        }

        // Cleanup
        return () => {
            starsContainer.innerHTML = ''
        }
    }, [])

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-radial from-[#0f1419] via-[var(--color-bg-dark)] to-[var(--color-bg-darker)]">
            {/* Stars */}
            <div ref={starsRef} className="absolute inset-0 pointer-events-none" />

            {/* Animated Grid */}
            <div
                className="absolute inset-0 opacity-50 animate-grid-move"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }}
            />
        </div>
    )
}
