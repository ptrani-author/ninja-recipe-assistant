interface RateLimitEntry {
  ip: string;
  requests: number;
  firstRequest: number;
  lastRequest: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly MAX_REQUESTS = 10;
  private readonly WINDOW_MS = 3 * 60 * 60 * 1000; // 3 ore in millisecondi

  isAllowed(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(ip);

    if (!entry) {
      // Prima richiesta per questo IP
      this.requests.set(ip, {
        ip,
        requests: 1,
        firstRequest: now,
        lastRequest: now
      });
      return { allowed: true, remaining: this.MAX_REQUESTS - 1, resetTime: now + this.WINDOW_MS };
    }

    // Controlla se la finestra temporale è scaduta
    if (now - entry.firstRequest > this.WINDOW_MS) {
      // Reset della finestra temporale
      this.requests.set(ip, {
        ip,
        requests: 1,
        firstRequest: now,
        lastRequest: now
      });
      return { allowed: true, remaining: this.MAX_REQUESTS - 1, resetTime: now + this.WINDOW_MS };
    }

    // Controlla se ha superato il limite
    if (entry.requests >= this.MAX_REQUESTS) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: entry.firstRequest + this.WINDOW_MS 
      };
    }

    // Incrementa il contatore
    entry.requests++;
    entry.lastRequest = now;
    this.requests.set(ip, entry);

    return { 
      allowed: true, 
      remaining: this.MAX_REQUESTS - entry.requests, 
      resetTime: entry.firstRequest + this.WINDOW_MS 
    };
  }

  // Pulisce le entry scadute (opzionale, per evitare memory leaks)
  cleanup() {
    const now = Date.now();
    Array.from(this.requests.entries()).forEach(([ip, entry]) => {
      if (now - entry.firstRequest > this.WINDOW_MS) {
        this.requests.delete(ip);
      }
    });
  }

  // Metodo per il testing - mostra lo stato attuale
  getStatus(ip: string) {
    const entry = this.requests.get(ip);
    if (!entry) {
      return { requests: 0, remaining: this.MAX_REQUESTS, firstRequest: null, lastRequest: null };
    }
    return {
      requests: entry.requests,
      remaining: this.MAX_REQUESTS - entry.requests,
      firstRequest: new Date(entry.firstRequest).toLocaleString(),
      lastRequest: new Date(entry.lastRequest).toLocaleString(),
      resetTime: new Date(entry.firstRequest + this.WINDOW_MS).toLocaleString()
    };
  }

  // Metodo per il testing - resetta per un IP specifico
  resetForIP(ip: string) {
    this.requests.delete(ip);
  }

  // Metodo per il testing - imposta un tempo di test più breve
  setTestMode() {
    (this as any).WINDOW_MS = 1 * 60 * 1000; // 1 minuto per i test
  }
}

export const rateLimiter = new RateLimiter(); 