import { Metadata } from "next";
import { Award, Target, Heart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about our mission, values, and the team behind ModernWeb.",
};

const values = [
  {
    icon: Target,
    title: "Innovation",
    description:
      "We stay at the forefront of technology, constantly exploring new ways to solve complex problems.",
  },
  {
    icon: Heart,
    title: "Quality",
    description:
      "Every project is crafted with attention to detail and commitment to excellence.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "We believe in the power of teamwork and close partnership with our clients.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for excellence in everything we do, from code quality to user experience.",
  },
];

const stats = [
  { label: "Projects Completed", value: "500+" },
  { label: "Happy Clients", value: "50+" },
  { label: "Years Experience", value: "5+" },
  { label: "Team Members", value: "20+" },
];

export default function About() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            About ModernWeb
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Building the Future of Web Development
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a passionate team of developers, designers, and innovators
            dedicated to creating exceptional web experiences that drive
            business growth and user engagement.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded in 2019, ModernWeb started as a small team of developers
              who believed that web development could be more efficient, more
              beautiful, and more impactful. We were frustrated with the
              complex, slow-moving tools available at the time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we've grown into a full-service web development agency that
              has helped hundreds of businesses transform their digital
              presence. Our commitment to innovation and quality has never
              wavered.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-3xl opacity-20"></div>
            <div className="relative bg-card border rounded-lg p-8 shadow-lg">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we
              make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mission Section */}
        <div className="text-center bg-muted/50 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            To empower businesses with cutting-edge web solutions that not only
            look stunning but also drive measurable results. We believe that
            great web experiences should be accessible to everyone, regardless
            of technical expertise.
          </p>
        </div>
      </div>
    </div>
  );
}
