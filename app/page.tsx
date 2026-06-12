import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { FeaturedProjects } from "@/components/featured-projects"
import { Skills } from "@/components/skills"
import { ResumeSection } from "@/components/resume-section"
import { ContactForm } from "@/components/contact-form"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedProjects />
        <Skills />
        <ResumeSection />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  )
}
