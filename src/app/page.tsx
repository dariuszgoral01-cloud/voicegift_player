import Link from 'next/link'
import Header from '../components/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="relative overflow-hidden">
        {/* Hero Section with Background Image */}
        <div 
          className="relative min-h-screen bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
          }}
        >
          <div className="relative z-10 flex items-center min-h-screen px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
            <div className="w-full text-center">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
                Create<br />
                Magical<br />
                <span className="text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">
                  Voice Gifts
                </span>
              </h1>
              
              <p className="max-w-2xl mx-auto mb-12 text-lg sm:text-xl text-white/90">
                Turn precious moments into lasting memories with personalized voice messages that touch hearts and create connections.
              </p>

              <div className="flex flex-col items-center justify-center max-w-sm gap-4 mx-auto">
                <Link 
                  href="/s/test123"
                  className="flex items-center justify-center w-full gap-2 px-6 py-4 font-semibold text-center text-white transition-all duration-300 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-xl hover:scale-105"
                >
                  <i className="ri-play-circle-line"></i>
                  Test Voice Player
                </Link>
                
                <a
                  href="https://voicegift.uk"
                  className="flex items-center justify-center w-full gap-2 px-6 py-4 font-semibold text-center text-gray-900 transition-all duration-300 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105"
                >
                  <i className="ri-mic-line"></i>
                  Create Custom Message
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16 bg-white sm:py-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                How VoiceGift Player Works
              </h2>
              <p className="text-lg text-gray-600">
                Simply tap your phone to hear voice messages instantly
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="p-8 text-center bg-gray-50 rounded-2xl">
                <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl">
                  <i className="text-2xl text-white ri-smartphone-line"></i>
                  <div className="absolute flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full -top-2 -right-2">
                    <span className="text-sm font-bold text-white">4</span>
                  </div>
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  They Tap Phone to Hear Voice
                </h3>
                
                <p className="leading-relaxed text-gray-600">
                  Your recipient simply holds their smartphone near the gift to instantly hear your voice message. No apps needed - pure magic that creates unforgettable moments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
          <div className="max-w-lg px-4 mx-auto text-center">
            <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
              Ready to Create Your Voice Gift?
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Start creating your personalized gift with voice message today
            </p>
            
            <a 
              href="https://voicegift.uk"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-gray-900 transition-all duration-300 bg-white rounded-full hover:bg-gray-100 hover:scale-105"
            >
              <i className="ri-mic-line"></i>
              Start Creating Now
            </a>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 bg-gradient-to-r from-amber-600 to-orange-600">
          <div className="max-w-lg px-4 mx-auto text-center">
            <h3 className="mb-3 text-xl font-bold text-white">
              Stay Connected
            </h3>
            <p className="mb-6 text-sm text-white/90">
              Get the latest updates on new gift designs, special offers, and heartwarming stories from our community of voice gift creators.
            </p>
            
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-0 rounded-full outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="w-full px-6 py-3 font-semibold text-orange-600 transition-all duration-300 bg-white rounded-full hover:bg-gray-100">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching VoiceGift design */}
      <footer className="text-white bg-gray-900">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                <i className="text-lg text-white ri-mic-line"></i>
              </div>
              <span className="text-white font-['Pacifico'] text-xl">VoiceGift</span>
            </div>
            <p className="max-w-md mx-auto text-sm text-gray-400">
              Creating meaningful connections through personalised voice messages. Share your voice, touch hearts, and make memories that last forever.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center mb-8 space-x-4">
            <a href="#" className="flex items-center justify-center w-10 h-10 transition-colors duration-300 bg-gray-800 rounded-full hover:bg-amber-600">
              <i className="text-white ri-facebook-line"></i>
            </a>
            <a href="#" className="flex items-center justify-center w-10 h-10 transition-colors duration-300 bg-gray-800 rounded-full hover:bg-amber-600">
              <i className="text-white ri-twitter-line"></i>
            </a>
            <a href="#" className="flex items-center justify-center w-10 h-10 transition-colors duration-300 bg-gray-800 rounded-full hover:bg-amber-600">
              <i className="text-white ri-instagram-line"></i>
            </a>
            <a href="#" className="flex items-center justify-center w-10 h-10 transition-colors duration-300 bg-gray-800 rounded-full hover:bg-amber-600">
              <i className="text-white ri-linkedin-line"></i>
            </a>
          </div>

          {/* Quick Links */}
          <div className="mb-8 space-y-2 text-center">
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <div className="space-y-2">
              <a href="https://voicegift.uk#shop" className="block text-gray-400 transition-colors duration-300 hover:text-white">Shop</a>
              <a href="https://voicegift.uk#account" className="block text-gray-400 transition-colors duration-300 hover:text-white">My Account</a>
              <a href="https://voicegift.uk#how-it-works" className="block text-gray-400 transition-colors duration-300 hover:text-white">How It Works</a>
              <a href="https://voicegift.uk#faq" className="block text-gray-400 transition-colors duration-300 hover:text-white">FAQ</a>
            </div>
          </div>

          {/* Support */}
          <div className="mb-8 text-center">
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <a href="https://voicegift.uk#contact" className="text-gray-400 transition-colors duration-300 hover:text-white">
              Contact Us
            </a>
          </div>

          {/* Bottom */}
          <div className="pt-6 text-center border-t border-gray-800">
            <p className="text-sm text-gray-500">voicegift.uk</p>
          </div>
        </div>
      </footer>
    </div>
  )
}