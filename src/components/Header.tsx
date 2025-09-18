export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="https://voicegift.uk" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
              <i className="text-lg text-white ri-mic-line"></i>
            </div>
            <span className="text-gray-800 font-['Pacifico'] text-xl">VoiceGift</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            <a href="https://voicegift.uk" className="font-medium text-gray-700 transition-colors duration-300 hover:text-amber-600">
              Home
            </a>
            <a href="https://voicegift.uk#how-it-works" className="font-medium text-gray-700 transition-colors duration-300 hover:text-amber-600">
              How It Works
            </a>
            <a href="https://voicegift.uk#shop" className="font-medium text-gray-700 transition-colors duration-300 hover:text-amber-600">
              Shop
            </a>
            <a href="https://voicegift.uk#create-recording" className="font-medium text-gray-700 transition-colors duration-300 hover:text-amber-600">
              Create Recording
            </a>
            <a href="https://voicegift.uk#contact" className="font-medium text-gray-700 transition-colors duration-300 hover:text-amber-600">
              Contact
            </a>
          </nav>

          {/* Mobile Menu + Order Button */}
          <div className="flex items-center gap-3">
            <a 
              href="https://voicegift.uk#order"
              className="px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 sm:px-6 sm:py-3 hover:shadow-xl hover:scale-105 sm:text-base"
            >
              Order Now
            </a>
            
            {/* Mobile Menu Button */}
            <button className="p-2 text-gray-700 md:hidden">
              <i className="text-xl ri-menu-line"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}