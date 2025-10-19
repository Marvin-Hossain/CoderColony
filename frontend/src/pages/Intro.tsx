import "./Intro.css";
import Button from "../components/Button";
import {API_CONFIG} from "@/services/config";

import googleLogo from "../assets/logos/google_logo.png";
import jpmcLogo from "../assets/logos/jpmc_logo.png";
import technufLogo from "../assets/logos/technuf_logo.png";

const Intro = () => {
    const handleGithubLogin = (): void => {
        window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.GITHUB;
    };

    const handleGoogleLogin = (): void => {
        window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.GOOGLE;
    };

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <a href="#main-content" className="skip-link">Skip to content</a>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="brand-logo">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <rect width="40" height="40" rx="8" fill="currentColor"/>
                                <path d="M8 12L20 8L32 12V28L20 32L8 28V12Z" fill="white" stroke="white" strokeWidth="1.5"/>
                                <path d="M12 16L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M12 20L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M12 24L28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <span className="font-semibold text-lg">
                            CoderColony
                        </span>
                    </div>
                </div>
            </nav>

            <main id="main-content">
                {/* Hero */}
                <section className="py-20 md:py-32">
                    <div className="container">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                                        Track, apply, and improve.
                                    </h1>
                                    <p className="text-xl text-muted-foreground max-w-xl">
                                        A focused job hunt OS for developers.
                                        CoderColony helps developers organize job
                                        applications, practice interview skills, and
                                        stay consistent.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            variant="outline"
                                            className="justify-center gap-2"
                                            onClick={() => scrollToSection("#signup")}
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            Continue with Google
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="justify-center gap-2"
                                            onClick={() => scrollToSection("#signup")}
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path
                                                    d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.5-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.9 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/>
                                            </svg>
                                            Continue with GitHub
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6 pt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex -space-x-2">
                                            <img
                                                src={googleLogo}
                                                alt="Google"
                                                className="h-8 w-8 rounded-full border-2 border-gray-200 bg-white p-1 object-contain"
                                            />
                                            <img
                                                src={jpmcLogo}
                                                alt="JP Morgan Chase"
                                                className="h-8 w-8 rounded-full border-2 border-gray-200 bg-white p-.5 object-contain"
                                            />
                                            <img
                                                src={technufLogo}
                                                alt="TechNuf"
                                                className="h-8 w-8 rounded-full border-2 border-gray-200 bg-white p-1 object-contain"
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Made for developers
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Dashboard Mock */}
                            <div className="relative">
                                <div className="bg-card border rounded-2xl p-6 shadow-xl">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Dashboard</h3>
                                            <div className="flex space-x-2">
                                                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                                                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                {
                                                    label: "Applications",
                                                    value: "23",
                                                    color: "text-primary",
                                                },
                                                {
                                                    label: "Interviews",
                                                    value: "8",
                                                    color: "text-secondary",
                                                },
                                                {
                                                    label: "Offers",
                                                    value: "2",
                                                    color: "text-green-600",
                                                },
                                            ].map((stat) => (
                                                <div
                                                    key={stat.label}
                                                    className="bg-muted rounded-lg p-4"
                                                >
                                                    <div
                                                        className={`text-2xl font-bold ${stat.color}`}
                                                    >
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Chart Area */}
                                        <div className="bg-muted rounded-lg p-4 h-32 flex items-end space-x-2">
                                            {[40, 65, 45, 80, 60, 90, 70].map(
                                                (height) => (
                                                    <div
                                                        key={height}
                                                        className="bg-primary rounded-t flex-1"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                ),
                                            )}
                                        </div>

                                        {/* Recent Activity */}
                                        <div className="space-y-2">
                                            {[
                                                "Applied to Frontend Developer at TechCorp",
                                                "Interview scheduled with StartupXYZ",
                                                "Practice completed: React Hooks",
                                            ].map((activity) => (
                                                <div
                                                    key={activity}
                                                    className="flex items-center space-x-3 p-2 bg-muted rounded"
                                                >
                                                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {activity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="progress" className="py-20 bg-muted/30">
                    <div className="container">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                How It Works
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Three simple steps to transform your job search into
                                a systematic process
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Track",
                                    description: "Log applications, statuses, deadlines",
                                    detail:
                                        "Keep all your job applications organized in one place. Track statuses, set deadlines, and never miss a follow-up.",
                                },
                                {
                                    title: "Analyze",
                                    description: "See weekly progress & streaks",
                                    detail:
                                        "Visual analytics show your application patterns, success rates, and help you optimize your job search strategy.",
                                },
                                {
                                    title: "Practice",
                                    description: "Question drills & rubric feedback",
                                    detail:
                                        "Sharpen your interview skills with coding challenges, behavioral questions, and structured feedback. Flashcards coming soon!",
                                },
                            ].map((step) => (
                                <div
                                    key={step.title}
                                    className="relative group hover:shadow-lg transition-shadow bg-card border rounded-lg p-8"
                                >
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-semibold">
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {step.description}
                                            </p>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {step.detail}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="applications" className="py-20">
                    <div className="container">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">Feature Highlights</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to manage your job search efficiently and effectively
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    title: "Application Tracker",
                                    description: "CRUD, tags, statuses",
                                    detail: "Complete application management with custom tags, status tracking, and detailed notes. Never lose track of where you applied.",
                                    mockChart: "applications",
                                },
                                {
                                    title: "Progress Analytics",
                                    description: "Daily/weekly charts, best day",
                                    detail: "Visual insights into your job search patterns. See your most productive days, application success rates, and weekly progress.",
                                    mockChart: "analytics",
                                },
                                {
                                    title: "Practice Hub",
                                    description: "Coding/behavioral drills",
                                    detail: "Structured practice sessions for technical interviews and behavioral questions. Flashcards and rubric feedback coming soon!",
                                    mockChart: "practice",
                                },
                                {
                                    title: "Reminders & Notes",
                                    description: "Deadlines, follow-ups",
                                    detail: "Smart reminders for application deadlines, interview prep, and follow-up actions. Keep everything organized with detailed notes.",
                                    mockChart: "reminders",
                                },
                            ].map((feature) => (
                                <div key={feature.title} className="group hover:shadow-lg transition-shadow bg-card border rounded-lg p-8">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.detail}
                                        </p>

                                        {/* Mock Visualization */}
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            {feature.mockChart === "applications" && (
                                                <div className="space-y-2">
                                                    {["In Progress", "Interview", "Applied", "Rejected"].map((status, i) => (
                                                        <div key={status} className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">{status}</span>
                                                            <div className="flex items-center space-x-2">
                                                                <div
                                                                    className="h-2 bg-primary rounded"
                                                                    style={{ width: `${[60, 30, 80, 20][i]}px` }}
                                                                />
                                                                <span>{[12, 6, 16, 4][i]}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {feature.mockChart === "analytics" && (
                                                <div className="flex items-end space-x-1 h-16">
                                                    {[40, 65, 45, 80, 60, 90, 70].map((height, i) => (
                                                        <div
                                                            key={i}
                                                            className="bg-primary rounded-t flex-1"
                                                            style={{ height: `${height}%` }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            {feature.mockChart === "practice" && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Completed</span>
                                                        <span className="font-medium">24/30</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }} />
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">React Hooks, Algorithms, System Design</div>
                                                </div>
                                            )}
                                            {feature.mockChart === "reminders" && (
                                                <div className="space-y-2">
                                                    {[
                                                        { text: "Follow up with TechCorp", time: "Today" },
                                                        { text: "Prepare for StartupXYZ", time: "Tomorrow" },
                                                        { text: "Application deadline", time: "3 days" },
                                                    ].map((reminder) => (
                                                        <div key={`${reminder.text}-${reminder.time}`} className="flex items-center space-x-2 text-xs">
                                                            <div className="h-2 w-2 bg-primary rounded-full" />
                                                            <span className="flex-1 text-muted-foreground">{reminder.text}</span>
                                                            <span className="text-primary">{reminder.time}</span>
                                                        </div>
                                                    ))}
                            </div>
                                            )}
                            </div>
                            </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="py-20 bg-muted/30">
                    <div className="container">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                About CoderColony
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Built by developers, for developers
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-12">
                            {/* Mission Statement */}
                            <div className="bg-card border rounded-lg p-8 text-center">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-semibold">
                                            Our Mission
                                        </h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                            We believe every developer deserves a
                                            systematic approach to job searching.
                                            CoderColony was born from our own
                                            frustrating experiences with scattered
                                            spreadsheets and missed opportunities. We're
                                            here to help you stay organized, practice
                                            consistently, and land your next great role.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Values */}
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    {
                                        title: "Developer-First",
                                        description:
                                            "Built with the tools and workflows developers actually use and love.",
                                    },
                                    {
                                        title: "Community Driven",
                                        description:
                                            "Your feedback shapes our roadmap. We're building this together.",
                                    },
                                    {
                                        title: "Privacy Focused",
                                        description:
                                            "Your job search data stays yours. We never sell or share personal information.",
                                    },
                                ].map((value) => (
                                    <div key={value.title} className="bg-card border rounded-lg p-6 text-center">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold">
                                                    {value.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {value.description}
                                                </p>
                            </div>
                        </div>
                    </div>
                                ))}
                            </div>

                            {/* Founders */}
                            <div className="bg-card border rounded-lg p-8">
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h3 className="text-2xl font-semibold">
                                            Meet the Team
                                        </h3>
                                        <p className="text-muted-foreground">
                                            We're a small but passionate team of
                                            developers who've been in your shoes.
                                        </p>
                            </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        {[
                                            {
                                                name: "Marvin Hossain",
                                                role: "Founder & CEO",
                                                bio: "Full-stack engineer with 3+ years experience.",
                                            },
                                            {
                                                name: "Mahmoud Hammad",
                                                role: "Co-founder & CTO",
                                                bio: "Full-stack engineer with 5+ years experience.",
                                            },
                                        ].map((founder) => (
                                            <div
                                                key={founder.name}
                                                className="text-center space-y-3"
                                            >
                                                <div className="space-y-2">
                                                    <div className="font-semibold">
                                                        {founder.name}
                                                    </div>
                                                    <div className="text-sm text-primary">
                                                        {founder.role}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {founder.bio}
                                                </p>
                                            </div>
                                        ))}
                            </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section id="signup" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
                    <div className="container">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-5xl font-bold">
                                    Join the colony.
                                    <br />
                                    <span className="text-primary">Ship your next offer.</span>
                                </h2>
                                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                    Take control of your job search today. Join hundreds of developers who've
                                    streamlined their path to landing great roles.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="justify-center gap-2"
                                        onClick={handleGoogleLogin}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Continue with Google
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="justify-center gap-2"
                                        onClick={handleGithubLogin}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.5-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.9 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/>
                                        </svg>
                                        Continue with GitHub
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    <strong>No credit card required.</strong> Free in beta.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Join our community of developers and start organizing your job search today.
                                </p>
                            </div>

                            {/* Trust Indicators */}
                            <div className="border-t pt-8">
                                <div className="grid md:grid-cols-3 gap-8 text-center">
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-primary">85%</div>
                                        <div className="text-sm text-muted-foreground">Interview Success Rate</div>
                                </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-primary">4.2/5</div>
                                        <div className="text-sm text-muted-foreground">Average User Rating</div>
                                </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-primary">30 days</div>
                                        <div className="text-sm text-muted-foreground">Avg. Time to Offer</div>
                                </div>
                                </div>
                        </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Intro;
