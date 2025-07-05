import { Code, Zap, Shield, Smartphone, Globe, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Code,
    title: 'Modern Development',
    description: 'Built with Next.js 13+, TypeScript, and the latest web technologies for optimal performance.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with server-side rendering, static generation, and intelligent caching.',
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Enterprise-grade security with built-in protection against common vulnerabilities.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Responsive design that works perfectly on all devices and screen sizes.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Deploy worldwide with CDN support and automatic optimization for any region.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Built for teams with version control, staging environments, and seamless workflows.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Build Modern Web Apps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to create exceptional web experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}