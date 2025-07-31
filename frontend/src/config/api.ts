// Configurazione API per Cloudflare Worker
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ninja-recipe-api.ptrani-author.workers.dev' // Worker URL
  : 'http://localhost:3000';

export const API_ENDPOINTS = {
  generateRecipe: `${API_BASE_URL}/api/generate-recipe`,
  testRateLimit: `${API_BASE_URL}/api/test-rate-limit`,
}; 