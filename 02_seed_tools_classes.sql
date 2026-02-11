-- Seed Sample Tools
INSERT INTO public.tools (title, description, price, link, visibility, image_url)
VALUES 
    (
        'Ultimate VS Code Setup', 
        'A curated collection of extensions, themes, and snippets to 10x your development productivity. Includes settings.json for instant config.', 
        'Free', 
        'https://code.visualstudio.com/', 
        'member',
        'https://images.unsplash.com/photo-1607799275518-d58665d096b1?auto=format&fit=crop&q=80&w=1600'
    ),
    (
        'SaaS UI Kit (Figma)', 
        'Complete design system for building modern text-heavy web applications. Includes 50+ components and 10+ page examples.', 
        '$49.00', 
        'https://www.figma.com/', 
        'member',
        'https://images.unsplash.com/photo-1626785774573-4b799314346d?auto=format&fit=crop&q=80&w=1600'
    ),
    (
        'Next.js + Supabase Starter', 
        'Production-ready boilerplate with Auth, Stripe, Tailwind, and SEO pre-configured. Save 20 hours on your next project setup.', 
        'Member Exclusive', 
        'https://github.com/', 
        'member',
        'https://images.unsplash.com/photo-1618477247222-ac5912453634?auto=format&fit=crop&q=80&w=1600'
    );

-- Seed Sample Classes
INSERT INTO public.classes (title, description, instructor, status, link, visibility, image_url)
VALUES 
    (
        'React Server Components Deep Dive', 
        'Master the new paradigm of React. Understand streaming, leverage server actions, and build blazing fast apps.', 
        'Sarah Drasner', 
        'open', 
        'https://react.dev', 
        'member',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1600'
    ),
    (
        'Advanced TypeScript Patterns', 
        'Go beyond the basics. Learn generic constraints, inferring types, conditional types, and mapped types to write bulletproof code.', 
        'Matt Pocock', 
        'ongoing', 
        'https://typescriptlang.org', 
        'member',
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1600'
    ),
    (
        'UI Design for Developers', 
        'Learn the fundamental principles of design to make your side projects look professional without hiring a designer.', 
        'Steve Schoger', 
        'closed', 
        'https://ui.dev', 
        'member',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1600'
    );
