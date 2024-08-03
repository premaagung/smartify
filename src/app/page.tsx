"use client"
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Rocket, Users, Cpu, Play, ChevronRight, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24 relative">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center md:justify-between">
              <div className="md:w-1/2 mb-12 md:mb-0 z-10">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in-up">
                  Learn Smarter,<br />Grow Faster
                </h1>
                <p className="text-xl mb-8 animate-fade-in-up delay-200">
                  Unlock your potential with our AI-powered learning platform.
                </p>
                <div className="flex space-x-4 animate-fade-in-up delay-400">
                  <Link href="/gallery">
                    <Button size="lg" variant="secondary" className="flex items-center bg-white text-blue-600 hover:bg-blue-100">
                      Get Started <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="flex items-center border-white text-white hover:bg-white hover:text-blue-600" onClick={() => setShowVideo(true)}>
                    Watch Demo <Play className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-30"></div>
                <Image 
                  src="/images/image.jpg"
                  alt="Learning illustration" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl relative z-10 animate-float"
                />
              </div>
            </div>
          </div>
          {showVideo && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg w-full max-w-3xl">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <Button className="mt-4" onClick={() => setShowVideo(false)}>Close</Button>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              Why Choose Smartify AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Expert-Led Courses", icon: BookOpen, description: "Learn from industry professionals and thought leaders." },
                { title: "Interactive Learning", icon: Users, description: "Engage in a collaborative, dynamic environment." },
                { title: "Career Advancement", icon: Rocket, description: "Boost your career prospects with in-demand skills." },
                { title: "AI-Powered Courses", icon: Cpu, description: "Experience personalized learning paths tailored to you." },
              ].map((feature, index) => (
                <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex items-center space-x-4 p-6">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
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
        <section className="py-24 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              How Smartify AI Works
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              {[
                { step: "1", title: "Sign Up", description: "Create your account and set your learning goals." },
                { step: "2", title: "AI Assessment", description: "Our AI evaluates your skills and suggests personalized courses." },
                { step: "3", title: "Learn & Practice", description: "Engage with interactive content and real-world projects." },
                { step: "4", title: "Track Progress", description: "Monitor your growth and earn certifications." },
              ].map((process, index) => (
                <div key={index} className="flex-1 bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {process.step}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">{process.title}</h3>
                  </div>
                  <p className="text-gray-700">{process.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              What Our Learners Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "John Doe", role: "Software Developer", testimonial: "Smartify AI has transformed the way I approach learning. The personalized curriculum and AI-guided practice sessions have accelerated my growth tremendously." },
                { name: "Jane Smith", role: "Data Scientist", testimonial: "The quality of courses and the interactive learning experience on Smartify AI are unparalleled. It's been instrumental in advancing my career in data science." },
                { name: "Emily Johnson", role: "UX Designer", testimonial: "I love how Smartify AI adapts to my learning pace and style. The project-based learning approach has helped me build a impressive portfolio alongside my new skills." },
              ].map((review, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <p className="text-gray-700 mb-6 italic">&ldquo;{review.testimonial}&rdquo;</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mr-4"></div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.name}</p>
                      <p className="text-gray-600 text-sm">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Accelerate Your Learning Journey?
            </h2>
            <p className="mb-10 text-xl max-w-2xl mx-auto">
              Join thousands of learners who have transformed their careers with Smartify AI. Start your personalized learning experience today!
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/gallery">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-100">
                  Explore Courses
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Pricing
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 py-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Smartify AI</h3>
              <p className="text-sm">Empowering learners worldwide with AI-driven education.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook size={24} />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Twitter size={24} />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin size={24} />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Instagram size={24} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            © 2024 Smartify AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}