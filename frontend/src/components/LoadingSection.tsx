export default function LoadingSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-2xl p-12">
          {/* Spinner */}
          <div className="mb-8">
            <div className="inline-block w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin glow-yellow"></div>
          </div>
          
          {/* Loading text */}
          <h3 className="text-2xl font-semibold text-white mb-4">
            Wir entwickeln dein Ninja-Rezept…
          </h3>
          
          <p className="text-gray-400">
            Unsere KI analysiert deine Zutaten und erstellt ein perfektes Rezept für deine Ninja-Heißluftfritteuse.
          </p>
        </div>
      </div>
    </section>
  );
} 