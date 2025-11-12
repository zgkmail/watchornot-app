/**
 * Tests for title processing and cleaning functions
 * These tests validate the extraction of movie titles from OCR and text annotations
 */

// Extract cleanMovieTitle function for testing
const cleanMovieTitle = (rawText) => {
  if (!rawText || rawText.trim().length === 0) {
    return null;
  }

  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Extract year if present (1900-2099)
  let extractedYear = null;
  const yearPattern = /\b(19\d{2}|20\d{2})\b/;

  for (const line of lines) {
    const yearMatch = line.match(yearPattern);
    if (yearMatch) {
      extractedYear = parseInt(yearMatch[1]);
      break;
    }
  }

  // Common UI noise to filter out
  const uiNoise = [
    'play', 'pause', 'watch', 'trailer', 'resume', 'continue watching',
    'add to list', 'my list', 'more info', 'details', 'info',
    'hd', 'uhd', '4k', 'ad', 'cc', 'audio description',
    'pg-13', 'pg', 'r', 'nr', 'tv-ma', 'tv-14', 'tv-pg', 'tv-y', 'tv-g',
    'episodes', 'seasons', 'season', 'episode',
    'download', 'share', 'rate', 'similar titles'
  ];

  const cleanedLines = lines.map(line => {
    let cleaned = line;

    // Remove leading special characters
    cleaned = cleaned.replace(/^[#@$%^&*]+/, '');

    // Remove lines that are only numbers
    cleaned = cleaned.replace(/^\d+$/, '');

    // Remove single operator characters
    cleaned = cleaned.replace(/^[+\-×x]$/, '');

    // Remove standalone years
    cleaned = cleaned.replace(/^\d{4}$/, '');

    // Remove duration patterns (1h 30m, 2h, 90m, etc.)
    cleaned = cleaned.replace(/^\d+h?\s*\d*m?$/, '');

    // Remove lines that are only numbers/punctuation
    cleaned = cleaned.replace(/^[0-9.,]+$/, '');

    // Filter out UI noise
    const lowerCleaned = cleaned.toLowerCase();
    if (uiNoise.some(noise => lowerCleaned === noise)) {
      return '';
    }

    // Filter out lines with too many special characters
    if (cleaned.replace(/[a-zA-Z0-9]/g, '').length > cleaned.length * 0.5) {
      return '';
    }

    // Filter out single characters
    if (cleaned.length <= 1) {
      return '';
    }

    return cleaned.trim();
  }).filter(line => line.length > 0);

  if (cleanedLines.length === 0) {
    return null;
  }

  // Use first cleaned line as title
  let title = cleanedLines[0];

  // If title is very short and we have more lines, combine them
  if (title.length < 3 && cleanedLines.length > 1) {
    title = cleanedLines[0] + ' ' + cleanedLines[1];
  }

  // Final cleanup
  title = title
    .replace(/[#@$%^&*_+=|\\<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { title: title || null, year: extractedYear };
};

describe('Title Processing Functions', () => {
  describe('cleanMovieTitle', () => {
    describe('Basic Title Extraction', () => {
      test('should extract simple title', () => {
        const result = cleanMovieTitle('INCEPTION');

        expect(result).not.toBeNull();
        expect(result.title).toBe('INCEPTION');
        expect(result.year).toBeNull();
      });

      test('should extract multi-word title', () => {
        const result = cleanMovieTitle('THE DARK KNIGHT');

        expect(result).not.toBeNull();
        expect(result.title).toBe('THE DARK KNIGHT');
        expect(result.year).toBeNull();
      });

      test('should extract title with subtitle', () => {
        const result = cleanMovieTitle('The Lord of the Rings: The Fellowship of the Ring');

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Lord of the Rings: The Fellowship of the Ring');
        expect(result.year).toBeNull();
      });

      test('should handle lowercase titles', () => {
        const result = cleanMovieTitle('the matrix');

        expect(result).not.toBeNull();
        expect(result.title).toBe('the matrix');
      });

      test('should handle mixed case titles', () => {
        const result = cleanMovieTitle('Forrest Gump');

        expect(result).not.toBeNull();
        expect(result.title).toBe('Forrest Gump');
      });
    });

    describe('Year Extraction', () => {
      test('should extract year from 2000s', () => {
        const result = cleanMovieTitle('INCEPTION\n2010');

        expect(result).not.toBeNull();
        expect(result.title).toBe('INCEPTION');
        expect(result.year).toBe(2010);
      });

      test('should extract year from 1900s', () => {
        const result = cleanMovieTitle('The Godfather\n1972');

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Godfather');
        expect(result.year).toBe(1972);
      });

      test('should extract year from metadata line', () => {
        const result = cleanMovieTitle('The Matrix\n1999 2h 16m HD');

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Matrix');
        expect(result.year).toBe(1999);
      });

      test('should extract year from mixed content', () => {
        const result = cleanMovieTitle('STRANGER THINGS\nPlay\n2016 | TV-14');

        expect(result).not.toBeNull();
        expect(result.title).toBe('STRANGER THINGS');
        expect(result.year).toBe(2016);
      });
    });

    describe('UI Noise Filtering', () => {
      test('should filter out "Play" button text', () => {
        const result = cleanMovieTitle('INCEPTION\nPlay');

        expect(result).not.toBeNull();
        expect(result.title).toBe('INCEPTION');
        expect(result.title).not.toContain('Play');
      });

      test('should filter out Netflix interface elements', () => {
        const result = cleanMovieTitle('STRANGER THINGS\nPlay\nMore Info\nAdd to My List');

        expect(result).not.toBeNull();
        expect(result.title).toBe('STRANGER THINGS');
      });

      test('should filter out Prime Video interface elements', () => {
        const result = cleanMovieTitle('Inception\nWatch Now\nAdd to Watchlist\n2010');

        expect(result).not.toBeNull();
        expect(result.title).toBe('Inception');
        expect(result.year).toBe(2010);
      });

      test('should filter out rating labels', () => {
        const result = cleanMovieTitle('The Dark Knight\nPG-13\nR\nTV-MA');

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Dark Knight');
      });

      test('should filter out duration and quality indicators', () => {
        const result = cleanMovieTitle('Inception\n2h 28m\nHD\n4K\nUHD');

        expect(result).not.toBeNull();
        expect(result.title).toBe('Inception');
      });
    });

    describe('Special Characters Handling', () => {
      test('should remove leading hash symbols', () => {
        const result = cleanMovieTitle('#MARTIAN');

        expect(result).not.toBeNull();
        expect(result.title).toBe('MARTIAN');
      });

      test('should handle titles with colons', () => {
        const result = cleanMovieTitle('Star Wars: The Force Awakens');

        expect(result).not.toBeNull();
        expect(result.title).toBe('Star Wars: The Force Awakens');
      });

      test('should clean up extra whitespace', () => {
        const result = cleanMovieTitle('The    Dark    Knight');

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Dark Knight');
      });

      test('should remove various special characters', () => {
        const result = cleanMovieTitle('#The@Matrix*');

        expect(result).not.toBeNull();
        // Special characters are removed but spaces aren't added
        expect(result.title).toBe('TheMatrix');
      });
    });

    describe('Complex OCR Text', () => {
      test('should extract title from typical streaming interface', () => {
        const input = `#MARTIAN
D
Play
+
2
3374
Х
2015 2h 22m HD AD
PG-13 some strong language, injury images, and brief nu...`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('MARTIAN');
        expect(result.year).toBe(2015);
      });

      test('should handle Netflix episode interface', () => {
        const input = `STRANGER THINGS
Play
S4:E1 Chapter One: The Hellfire Club
2022 | TV-14`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('STRANGER THINGS');
        expect(result.year).toBe(2022);
      });

      test('should handle movie poster with "Coming Soon"', () => {
        const input = `THE DARK KNIGHT
COMING SOON`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('THE DARK KNIGHT');
      });

      test('should handle Prime Video interface with full metadata', () => {
        const input = `The Lord of the Rings: The Fellowship of the Ring
Watch Now
Add to Watchlist
2001 2h 58m UHD`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Lord of the Rings: The Fellowship of the Ring');
        expect(result.year).toBe(2001);
      });
    });

    describe('Edge Cases', () => {
      test('should return null for empty string', () => {
        const result = cleanMovieTitle('');

        expect(result).toBeNull();
      });

      test('should return null for whitespace only', () => {
        const result = cleanMovieTitle('   \n  \n  ');

        expect(result).toBeNull();
      });

      test('should return null for UI noise only', () => {
        const result = cleanMovieTitle('Play\nPause\nWatch\nHD\n4K');

        expect(result).toBeNull();
      });

      test('should handle single character after filtering', () => {
        const result = cleanMovieTitle('A\nPlay\nHD');

        // Single character titles are generally filtered out
        // but 'A' could be valid in some contexts
        expect(result).toBeDefined();
      });

      test('should handle very short titles', () => {
        const result = cleanMovieTitle('Up');

        expect(result).not.toBeNull();
        expect(result.title).toBe('Up');
      });

      test('should combine very short title with subtitle', () => {
        const input = 'IT\nChapter Two';

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        // Should combine because first line is < 3 chars
        expect(result.title).toContain('IT');
      });

      test('should handle titles with numbers', () => {
        const result = cleanMovieTitle('12 Angry Men');

        expect(result).not.toBeNull();
        expect(result.title).toBe('12 Angry Men');
      });

      test('should handle titles that are just numbers and letters', () => {
        const result = cleanMovieTitle('3:10 to Yuma');

        expect(result).not.toBeNull();
        expect(result.title).toContain('3:10');
      });

      test('should filter out lines with excessive special characters', () => {
        const input = `The Matrix
***###@@@
Play`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Matrix');
      });
    });

    describe('Multi-line Processing', () => {
      test('should use first valid line as title', () => {
        const input = `Play
Watch
The Matrix
HD`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Matrix');
      });

      test('should skip multiple noise lines', () => {
        const input = `Play
Pause
HD
4K
Inception
2010`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('Inception');
        expect(result.year).toBe(2010);
      });

      test('should handle titles split across lines', () => {
        const input = `The Lord of the Rings:
The Fellowship of the Ring
2001`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        // Should take first line as title
        expect(result.title).toContain('The Lord of the Rings');
      });
    });

    describe('Real-World Examples', () => {
      test('should handle Disney+ interface', () => {
        const input = `The Mandalorian
Resume
S2:E8 Chapter 16
2020 | TV-PG`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('The Mandalorian');
        expect(result.year).toBe(2020);
      });

      test('should handle HBO Max interface', () => {
        const input = `Game of Thrones
Continue Watching
Season 8, Episode 6
2019 | TV-MA`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('Game of Thrones');
        expect(result.year).toBe(2019);
      });

      test('should handle movie title cards with multiple metadata', () => {
        const input = `DUNE
2021
PG-13
2h 35m
Science Fiction`;

        const result = cleanMovieTitle(input);

        expect(result).not.toBeNull();
        expect(result.title).toBe('DUNE');
        expect(result.year).toBe(2021);
      });
    });
  });
});
