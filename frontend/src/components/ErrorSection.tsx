interface ErrorSectionProps {
  error: string;
  onTryAgain: () => void;
}

export default function ErrorSection({ error, onTryAgain }: ErrorSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-2xl p-12 border border-red-500/20">
          {/* Error icon */}
          <div className="mb-6">
            <div className="inline-block w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          {/* Error message */}
          <h3 className="text-2xl font-semibold text-white mb-4">
            Ups! Das hat nicht geklappt
          </h3>
          
          <p className="text-gray-400 mb-8">
            {error}
          </p>
          
          {/* Try again button */}
          <button
            onClick={onTryAgain}
            className="px-8 py-3 text-lg font-semibold text-black btn-primary rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 glow-yellow"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    </section>
  );
} 