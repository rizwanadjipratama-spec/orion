import Section from "@/components/ui/Section"
import Container from "@/components/ui/Container"
import { getPublicAboutContent } from "@/lib/about-server"
import ScrollReveal from "@/components/effects/ScrollReveal"
import HeadingReveal from "@/components/effects/HeadingReveal"

export default async function About() {
  const content = await getPublicAboutContent()

  return (
    <Section id="about">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-[6rem]">
          <ScrollReveal y={20}>
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-[var(--signal)]">About</p>
            <HeadingReveal
              text={content.title}
              className="mt-6 font-display text-[clamp(2.4rem,4.5vw,4rem)] leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)]"
              delay={0.04}
            />
            <p className="mt-6 max-w-xl text-lg leading-[1.7] text-[var(--muted)]">{content.subtitle}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.08} y={20} className="saintce-panel p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-3">
              {[content.paragraph1, content.paragraph2, content.paragraph3].map((paragraph, index) => (
                <ScrollReveal key={index} delay={0.12 + index * 0.05} y={14} className="saintce-inset rounded-[24px] p-5">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Node 0{index + 1}
                  </p>
                  <p className="mt-4 text-[0.98rem] leading-[1.8] text-[var(--text-primary)]">{paragraph}</p>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  )
}
