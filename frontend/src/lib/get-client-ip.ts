import { NextRequest } from 'next/server';

export function getClientIP(request: NextRequest): string {
  // Prova a ottenere l'IP da diversi header
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for può contenere più IP, prendiamo il primo
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback per localhost durante lo sviluppo
  return '127.0.0.1';
} 