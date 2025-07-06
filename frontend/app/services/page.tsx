import { Metadata } from "next";
import { Code, Smartphone, Palette, Zap, Globe, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Comprehensive web development services including modern web applications, mobile apps, and UI/UX design.",
};

const services = [
  {
    icon: Code,
    title: "Web Development",
    description:
      "Custom web applications built with Next.js, React, and modern technologies.",
    features: [
      "Next.js & React",
      "TypeScript",
      "Server-side Rendering",
      "API Integration",
    ],
    price: "Starting at $5,000",
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description:
      "Native and cross-platform mobile applications for iOS and Android.",
    features: [
      "React Native",
      "Native iOS & Android",
      "Cross-platform",
      "App Store Deployment",
    ],
    price: "Starting at $8,000",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Beautiful, user-centered design that converts visitors into customers.",
    features: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
    price: "Starting at $3,000",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description:
      "Speed up your existing applications and improve user experience.",
    features: [
      "Core Web Vitals",
      "Bundle Optimization",
      "Caching Strategies",
      "CDN Setup",
    ],
    price: "Starting at $2,500",
  },
  {
    icon: Globe,
    title: "E-commerce Solutions",
    description:
      "Complete online stores with payment processing and inventory management.",
    features: [
      "Shopping Cart",
      "Payment Integration",
      "Inventory Management",
      "Analytics",
    ],
    price: "Starting at $7,500",
  },
  {
    icon: BarChart3,
    title: "Analytics & SEO",
    description:
      "Data-driven insights and search engine optimization for better visibility.",
    features: [
      "Google Analytics",
      "SEO Optimization",
      "Performance Monitoring",
      "Reporting",
    ],
    price: "Starting at $1,500",
  },
];

export default function Services() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Complete Web Development Solutions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From concept to deployment, we provide end-to-end web development
            services tailored to your business needs and goals.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-background"
              >
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">
                      {service.price}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/contact">Get Quote</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process Section */}
        <div className="bg-muted/50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Process</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We follow a proven methodology to ensure your project is delivered
            on time, within budget, and exceeds your expectations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery",
                description: "Understanding your needs and goals",
              },
              {
                step: "02",
                title: "Planning",
                description: "Creating a detailed project roadmap",
              },
              {
                step: "03",
                title: "Development",
                description: "Building your solution with care",
              },
              {
                step: "04",
                title: "Launch",
                description: "Deploying and optimizing for success",
              },
            ].map((phase, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {phase.step}
                </div>
                <div className="text-lg font-semibold mb-2">{phase.title}</div>
                <div className="text-sm text-muted-foreground">
                  {phase.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
