import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Rocket, Users, Cpu } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center md:justify-between">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  Learn Smarter, Grow Faster
                </h1>
                <p className="text-lg mb-8">
                  Unlock your potential with our learning platform.
                </p>
                <Link href="https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=406113766044-dld0rkmum5s7i217kkm9bvdgc472akvu.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle&state=zeDN8E8stU9ecEwkUeTR7I7WNWXrimTbNyg25m0tDNU&code_challenge=2z9ieJuf5_VvUqGKwXdPtn1RtgQRcH0-f16UrdKE1ow&code_challenge_method=S256&service=lso&o2v=2&ddm=0&flowName=GeneralOAuthFlow">
                  <Button size="lg" variant="secondary" className="flex items-center">
                    Get Started <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <Image 
                  src="/images/image.jpg"
                  alt="Learning illustration" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Expert-Led Courses", icon: BookOpen, description: "Learn from industry professionals." },
                { title: "Interactive Learning", icon: Users, description: "Engage in a collaborative environment." },
                { title: "Career Advancement", icon: Rocket, description: "Boost your career prospects." },
                { title: "AI-Powered Courses", icon: Cpu, description: "Personalized learning paths." },
              ].map((feature, index) => (
                <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="flex items-center space-x-4 p-6">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                    <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-700">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              {[
                { step: "1", title: "Sign Up", description: "Create an account to get started." },
                { step: "2", title: "Choose Courses", description: "Select courses that fit your goals." },
                { step: "3", title: "Start Learning", description: "Engage with course materials." },
                { step: "4", title: "Achieve Goals", description: "Complete courses and earn certifications." },
              ].map((process, index) => (
                <div key={index} className="flex-1 bg-gray-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{process.step}. {process.title}</h3>
                  <p className="text-gray-700">{process.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              What Our Users Say
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              {[
                { name: "John Doe", testimonial: "This platform has transformed the way I learn." },
                { name: "Jane Smith", testimonial: "An incredible learning experience!" },
                { name: "Emily Johnson", testimonial: "I love the personalized learning paths." },
              ].map((review, index) => (
                <div key={index} className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                  <p className="text-gray-700 mb-4">"{review.testimonial}"</p>
                  <p className="font-semibold text-gray-800">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="mb-8 text-lg">
              Join thousands of learners who have transformed their careers with us.
            </p>
            <Link href="/gallery">
              <Button size="lg" variant="secondary">
                Explore Courses
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto px-6 text-center text-gray-300">
          © 2024 Your Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}