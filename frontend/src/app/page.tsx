'use client';

import { useState, useRef } from 'react';
import { Recipe, RecipeFilters } from '@/types';
import { API_ENDPOINTS } from '@/config/api';
import HeroSection from '@/components/HeroSection';
import InputSection from '@/components/InputSection';
import LoadingSection from '@/components/LoadingSection';
import RecipeSection from '@/components/RecipeSection';
import ErrorSection from '@/components/ErrorSection';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; resetTime: string } | null>(null);
  
  const loadingRef = useRef<HTMLDivElement>(null);
  const recipeRef = useRef<HTMLDivElement>(null);

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Bitte gib mindestens einen Zutat ein.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setRateLimitInfo(null);

    // Scroll to loading section
    setTimeout(() => {
      loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const response = await fetch(API_ENDPOINTS.generateRecipe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients, filters }),
      });

      const data = await response.json();

      // Estrai informazioni sul rate limit dagli header
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      if (remaining && resetTime) {
        setRateLimitInfo({
          remaining: parseInt(remaining),
          resetTime: new Date(parseInt(resetTime)).toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || 'Rate limit exceeded. Please try again later.');
        } else {
          setError(data.error || 'Ein Fehler ist aufgetreten.');
        }
        return;
      }

      setRecipe(data);
      
      // Scroll to recipe section when ready
      setTimeout(() => {
        recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError('Verbindungsfehler. Bitte überprüfe deine Internetverbindung.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewRecipe = () => {
    generateRecipe();
  };

  const resetForm = () => {
    setRecipe(null);
    setError(null);
    setRateLimitInfo(null);
  };

  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <HeroSection onGetStarted={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })} />
      
      {/* Input Section */}
      <div id="input-section">
        <InputSection
          ingredients={ingredients}
          setIngredients={setIngredients}
          filters={filters}
          setFilters={setFilters}
          onGenerate={generateRecipe}
          disabled={isLoading}
          rateLimitInfo={rateLimitInfo}
        />
      </div>

      {/* Loading Section */}
      {isLoading && (
        <div ref={loadingRef}>
          <LoadingSection />
        </div>
      )}

      {/* Error Section */}
      {error && <ErrorSection error={error} onTryAgain={resetForm} />}

      {/* Recipe Section */}
      {recipe && (
        <div ref={recipeRef}>
          <RecipeSection
            recipe={recipe}
            onGenerateNew={generateNewRecipe}
            onChangeIngredients={resetForm}
          />
        </div>
      )}
    </main>
  );
} 