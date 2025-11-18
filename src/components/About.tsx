import { Heart, Users, Shield, Award, Phone, Mail, Star, TrendingUp, Globe } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "We understand the difficulty of losing a loved one and approach every interaction with empathy and care.",
    color: "bg-rose-500"
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "We maintain the highest standards of honesty and transparency in all our services and communications.",
    color: "bg-blue-500"
  },
  {
    icon: Users,
    title: "Community",
    description: "We bring people together to celebrate lives, share memories, and support one another during difficult times.",
    color: "bg-purple-500"
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every service we provide, ensuring dignity and respect for your loved ones.",
    color: "bg-amber-500"
  }
];

const team = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Founder & CEO",
    description: "With over 20 years in bereavement services, Sarah founded Funeral Notices to modernize how we honor and remember loved ones."
  },
  {
    name: "James O'Connor",
    role: "Head of Client Services",
    description: "James leads our compassionate team, ensuring every family receives personalized support during their time of need."
  },
  {
    name: "Emily Chen",
    role: "Director of Operations",
    description: "Emily oversees our nationwide network of funeral directors and service providers, maintaining our high standards."
  }
];

const stats = [
  { icon: Users, value: "50,000+", label: "Families Served" },
  { icon: Globe, value: "500+", label: "Partner Locations" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
  { icon: TrendingUp, value: "19 Years", label: "Of Experience" }
];

export function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header with Image */}
      <div className="relative h-[400px] bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1626895684825-03b8655f26b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjMyMjcxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Team collaboration"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl text-white mb-4">About Funeral Notices</h1>
            <p className="text-xl text-slate-200">
              Honoring memories and celebrating lives with dignity, respect, and compassion since 2005
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 -mt-20 relative z-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white shadow-xl border-2 border-slate-200">
                <div className="p-6 text-center">
                  <Icon className="h-8 w-8 text-[#0f172a] mx-auto mb-3" />
                  <div className="text-3xl text-[#0f172a] mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl text-[#0f172a] mb-3">Our Story</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-8 md:p-12 border border-slate-200">
            <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
              <p>
                Funeral Notices was founded in 2005 with a simple mission: to help families honor and remember their loved ones in a meaningful, accessible way. We recognized that traditional funeral notices were often limited in reach and lacked the personal touch that families desired.
              </p>
              <p>
                Today, we've grown to become the UK's leading online funeral notice platform, serving thousands of families each year. Our comprehensive services help people across the country share memories, coordinate funeral arrangements, and support one another through the grieving process.
              </p>
              <p>
                We believe that every life deserves to be celebrated and remembered. Through our platform, we provide families with the tools and support they need to create lasting tributes that honor the unique story of each individual.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-[#0f172a] mb-3">Our Values</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center border-2 border-slate-200 hover:border-[#0f172a] transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
                  <div className="p-6">
                    <div className={`${value.color} text-white rounded-2xl p-5 w-fit mx-auto mb-4 shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl text-[#0f172a] mb-3">{value.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Leadership Team */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-[#0f172a] mb-3">Our Leadership Team</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#0f172a] to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-2 border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 bg-white overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-[#0f172a] to-blue-500"></div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-[#0f172a] to-blue-500 rounded-full h-28 w-28 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Users className="h-14 w-14 text-white" />
                  </div>
                  <h3 className="text-xl text-[#0f172a] text-center mb-1">{member.name}</h3>
                  <p className="text-sm text-blue-600 text-center mb-4">{member.role}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{member.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-[#0f172a] via-blue-900 to-[#0f172a] text-white rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative max-w-3xl mx-auto">
            <h2 className="text-4xl mb-4 text-center">Get in Touch</h2>
            <p className="text-slate-200 text-lg mb-8 text-center">
              We're here to help and answer any questions you may have. Contact us and we'll respond as soon as possible.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/15 transition-all">
                <div className="p-8 text-center">
                  <div className="bg-white/20 rounded-full p-4 w-fit mx-auto mb-4">
                    <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl mb-2">Phone Support</h3>
                  <p className="text-slate-200 text-sm mb-4">Available 24/7</p>
                  <Button className="bg-white text-[#0f172a] hover:bg-slate-100 shadow-lg">
                    <Phone className="h-4 w-4 mr-2" />
                    0800 123 4567
                  </Button>
                </div>
              </Card>
              <Card className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/15 transition-all">
                <div className="p-8 text-center">
                  <div className="bg-white/20 rounded-full p-4 w-fit mx-auto mb-4">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl mb-2">Email Us</h3>
                  <p className="text-slate-200 text-sm mb-4">We'll respond within 24 hours</p>
                  <Button className="bg-white text-[#0f172a] hover:bg-slate-100 shadow-lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}