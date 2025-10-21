import { Injectable } from '@nestjs/common';
import { distance as levenshtein } from 'fastest-levenshtein';

// Basic normalization: lowercase + remove accents + trim + single spaces + drop punctuation.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

@Injectable()
export class SimilarityService {
  /**
   * Decide if `guess` should be accepted for `word`.
   * Rules:
   *  - Exact match after normalization → accept
   *  - Small typos allowed: Levenshtein distance threshold based on length
   *  - If guess contains the target word as a whole token (derivative/cheat), reject
   */
  isAcceptable(
    word: string,
    guess: string,
  ): { match: boolean; reason?: string; distance?: number } {
    const w = normalize(word);
    const g = normalize(guess);

    if (!w || !g) return { match: false, reason: 'empty' };

    // Reject if guess contains the word as a whole token (derivative rule for describer, but
    // here it protects against trivial cases if client passes through describer text).
    const tokenRe = new RegExp(`\\b${this.escapeRegex(w)}\\b`, 'i');
    if (tokenRe.test(g) && g !== w) {
      return { match: false, reason: 'derivative' };
    }

    if (w === g) return { match: true, distance: 0 };

    const d = levenshtein(w, g);
    const max = w.length <= 4 ? 1 : w.length <= 7 ? 2 : 3; // allow 1-3 edits depending on length

    if (d <= max) return { match: true, distance: d };
    return { match: false, reason: 'typo-too-far', distance: d };
  }

  private escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
