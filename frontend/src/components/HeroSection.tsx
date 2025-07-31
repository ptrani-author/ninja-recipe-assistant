interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg to-black"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-yellow-orange">
          Dein persönlicher Ninja-Rezept-Assistent
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Gib ein, was du im Kühlschrank hast – wir zaubern ein neues, alltagstaugliches Ninja-Rezept nur für dich.
        </p>
        
        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black btn-primary rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 glow-yellow"
        >
          <span className="relative z-10">Los geht&apos;s</span>
          <div className="absolute inset-0 gradient-orange-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-xl glow-yellow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-500 rounded-full opacity-20 blur-xl glow-orange"></div>
      </div>
    </section>
  );
} 