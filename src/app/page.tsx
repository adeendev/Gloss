// ============================================
// FILE: src/app/page.tsx
// ============================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Car, Sparkles, Droplets, Clock, Star, ArrowRight, Shield, CheckCircle, Users, Award } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "Amazing service! My car looks brand new. The attention to detail is incredible.",
      rating: 5,
      service: "Full Detail Package"
    },
    {
      name: "Mike Chen",
      text: "Professional team, fair pricing, and exceptional results. Highly recommended!",
      rating: 5,
      service: "Exterior Wash & Wax"
    },
    {
      name: "Emily Davis",
      text: "Quick service without compromising quality. Perfect for my busy schedule.",
      rating: 5,
      service: "Quick Service"
    }
  ]

  const features = [
    { icon: Shield, title: "Insured & Licensed", desc: "Fully insured professional service" },
    { icon: Clock, title: "Same Day Service", desc: "Book and get serviced today" },
    { icon: Award, title: "Premium Quality", desc: "Only the best products and techniques" },
    { icon: Users, title: "Expert Team", desc: "Trained and experienced professionals" }
  ]

  const services = [
    {
      icon: Droplets,
      title: "Exterior Wash",
      description: "Complete exterior cleaning with premium products and protective coatings",
      price: "From $49",
      features: ["Hand wash", "Tire shine", "Window cleaning", "Protective wax"],
      color: "blue-800"
    },
    {
      icon: Sparkles,
      title: "Interior Detail",
      description: "Deep cleaning and conditioning of all interior surfaces and upholstery",
      price: "From $79",
      features: ["Vacuum & shampoo", "Leather conditioning", "Dashboard polish", "Air freshening"],
      color: "green-600"
    },
    {
      icon: Car,
      title: "Full Detail",
      description: "Complete interior and exterior detailing package for ultimate care",
      price: "From $149",
      features: ["Everything included", "Paint correction", "Ceramic coating", "Engine bay cleaning"],
      color: "purple-600",
      popular: true
    },
    {
      icon: Clock,
      title: "Quick Service",
      description: "Fast and efficient cleaning perfect for busy schedules",
      price: "From $29",
      features: ["Express wash", "Quick vacuum", "Tire shine", "Window cleaning"],
      color: "orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-800">
              AutoShine Detailing
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="hover:bg-gray-50 border-gray-300 transition-all duration-300">
                Admin
              </Button>
            </Link>
            <Link href="/booking">
              <Button className="bg-blue-800 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Book Service
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 bg-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center">
            <div className={`space-y-8 text-center max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-300">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Rated #1 Car Detailing Service
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-blue-800">
                    Your Car Deserves
                  </span>
                  <br />
                  <span className="text-gray-900">Professional Care</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Premium car detailing services that make your vehicle look and feel brand new. 
                  Easy online booking with instant confirmation and same-day service available.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Book Your Detail Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-700 hover:bg-blue-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
                >
                  View Services
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700 font-medium">Insured & Licensed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-blue-800" />
                  <span className="text-gray-700 font-medium">Same Day Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <span className="text-gray-700 font-medium">Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-700 font-medium">Expert Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-purple-200">
            <Sparkles className="h-4 w-4" />
            Our Premium Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-800">
            Choose Your Perfect Package
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional car detailing services designed to keep your vehicle looking its absolute best
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group relative">
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="relative h-full bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 p-8">
                <div className={`w-16 h-16 bg-${service.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <div className={`text-2xl font-bold text-${service.color}`}>
                    {service.price}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className={`w-full bg-${service.color} hover:bg-${service.color}/90 text-white hover:shadow-lg transition-all duration-300`}>
                  Choose Package
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-300">
              <Users className="h-4 w-4" />
              Customer Reviews
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-800">
              What Our Customers Say
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gray-50 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">{testimonials[currentTestimonial].name}</div>
                    <div className="text-sm text-gray-500">{testimonials[currentTestimonial].service}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial indicators */}
              <div className="flex justify-center mt-8 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-blue-800 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200">
            <Award className="h-4 w-4" />
            Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-800">
            No Hidden Fees, Just Quality
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upfront pricing with no surprises. Book online and pay securely with our advance payment system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-800 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Choose Service</p>
                  <p className="text-sm text-gray-600">Select your preferred package</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-800 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Book Online</p>
                  <p className="text-sm text-gray-600">Pay 20% advance to secure</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-800 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Get Serviced</p>
                  <p className="text-sm text-gray-600">Professional service at your location</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800">What's Included</h3>
            <div className="space-y-3">
              {[
                "Professional grade products",
                "Fully insured service",
                "Satisfaction guarantee",
                "Same day availability",
                "WhatsApp updates",
                "Flexible scheduling"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-100 rounded-2xl p-8 shadow-lg border border-blue-300 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Special Offers</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-300">
                <p className="font-medium text-blue-800">First Time Customer</p>
                <p className="text-2xl font-bold text-gray-800">15% OFF</p>
                <p className="text-sm text-gray-600">On any full detail package</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="font-medium text-purple-600">Monthly Package</p>
                <p className="text-2xl font-bold text-gray-800">20% OFF</p>
                <p className="text-sm text-gray-600">Subscribe for regular service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 bg-blue-800">
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Transform Your Car?</h2>
            <p className="text-xl md:text-2xl mb-10 text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Book your professional car detailing service today and experience the difference that premium care makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/booking">
                <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300">
                  Schedule Your Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-8 text-blue-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Same Day Service</span>
                </div>
                <div className="flex items-center gap-2">
                   <Star className="h-5 w-5" />
                   <span>Premium Quality</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Shield className="h-5 w-5" />
                   <span>Fully Insured</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <span className="text-2xl font-bold text-blue-300">AutoShine Detailing</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Professional car detailing services that make your vehicle shine like new.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Exterior Wash</li>
                <li className="hover:text-white transition-colors cursor-pointer">Interior Detail</li>
                <li className="hover:text-white transition-colors cursor-pointer">Full Detail</li>
                <li className="hover:text-white transition-colors cursor-pointer">Quick Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Ceramic Coating</li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Our Team</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Refund Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-center md:text-left">
                © 2024 AutoShine Detailing. All rights reserved. | Crafted with care for your vehicle.
              </p>
              <div className="flex items-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Licensed & Insured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}