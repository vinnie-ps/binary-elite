import { createClient } from '@/lib/supabase/server'
import AnimatedBackground from '@/components/landing/AnimatedBackground'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Projects from '@/components/landing/Projects'
import Exclusive from '@/components/landing/Exclusive'
import Footer from '@/components/landing/Footer'
import FeaturedPartners from '@/components/landing/FeaturedPartners'

export const revalidate = 0 // Revalidate every 0 seconds

async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value')

  const settings: Record<string, string> = {}
  data?.forEach(setting => {
    settings[setting.setting_key] = setting.setting_value
  })

  return settings
}

async function getFeatures() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('feature_cards')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  return data || []
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  return data || []
}

export default async function Home() {
  const [settings, features, projects] = await Promise.all([
    getSettings(),
    getFeatures(),
    getProjects()
  ])

  return (
    <>
      <AnimatedBackground />

      <main className="relative z-10">
        <Hero
          title={settings.hero_title || 'Binary Elite'}
          tagline={settings.hero_tagline || 'Where elite tech minds build the future of education'}
          description={settings.hero_description || 'A collective of developers, designers, and AI builders pushing the boundaries of learning through technology.'}
          videoUrl={settings.hero_video_url}
          secondaryLogoUrl={settings.secondary_logo_url}
        />

        <Features features={features} />

        <Projects projects={projects} />

        <FeaturedPartners />

        <Exclusive
          title={settings.exclusive_title || "Who It's For"}
          statement={settings.exclusive_statement || "Binary Elite isn't for everyone — and that's intentional."}
        />

        <Footer
          text={settings.footer_text || '© 2026 Binary Elite. Building the future of education.'}
        />
      </main>
    </>
  )
}
