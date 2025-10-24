import {Target, ClipboardList, BarChart3, Sparkles, Users} from 'lucide-react';
import PageHeader from '../components/PageHeader';

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  tags: string[];
};

const features: Feature[] = [
  {
    title: "Application Tracking",
    description: "Stay on top of every role with centralized status updates, reminders, and notes.",
    icon: ClipboardList,
    tags: ["Pipeline", "Reminders"]
  },
  {
    title: "Interview Practice",
    description: "Level up behavioral and technical answers using guided prompts and AI feedback.",
    icon: Target,
    tags: ["STAR Method", "Mock Sessions"]
  },
  {
    title: "Progress Monitoring",
    description: "Visualize your momentum with daily and weekly goals that keep you accountable.",
    icon: BarChart3,
    tags: ["Goals", "Analytics"]
  },
  {
    title: "AI Feedback",
    description: "Get instant, actionable insights that highlight strengths and gaps in your responses.",
    icon: Sparkles,
    tags: ["Personalized", "Actionable"]
  }
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 space-y-10">
        <PageHeader
          title="About CoderColony"
          subtitle="Your complete job search management platform"
        />

        <section className="space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
          <p className="text-base leading-relaxed text-muted-foreground">
            CoderColony simplifies the job search experience by bringing every task—applications, prep,
            and progress—into a single, focused workspace. We built the toolkit we wanted when we were
            managing interview pipelines, juggling practicing, and trying to stay motivated.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="space-y-4 rounded-xl border bg-muted/20 p-6 shadow-sm transition-transform"
                  style={{transition: 'transform 0.2s ease, box-shadow 0.2s ease'}}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-primary/5 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-primary">Our Mission</h3>
          <blockquote className="text-base italic text-muted-foreground">
            “Empower job seekers with thoughtful tools and guidance so the search feels intentional,
            manageable, and ultimately more successful.”
          </blockquote>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-8 shadow-xl">
          <div className="inline-flex items-center gap-3 rounded-full bg-muted/20 px-4 py-2 text-sm font-semibold text-muted-foreground">
            <Users className="h-4 w-4" />
            Built by developers, for developers
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            CoderColony was created by a team who has navigated the modern tech hiring loop many times.
            We combine engineering expertise with empathy for the process—crafting workflows, AI prompts,
            and progress trackers that reduce friction and help you stay focused on landing the right role.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
