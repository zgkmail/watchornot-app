/**
 * Script to validate poster URLs in onboarding movies
 * Checks each poster URL to ensure it loads successfully
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MOVIES_FILE = path.join(__dirname, '../data/onboarding-movies.json');
const BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function checkPosterURL(posterPath) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${posterPath}`;

    https.get(url, (res) => {
      resolve({
        posterPath,
        status: res.statusCode,
        valid: res.statusCode === 200
      });
    }).on('error', (err) => {
      console.error(`Error checking ${posterPath}:`, err.message);
      resolve({
        posterPath,
        status: 'ERROR',
        valid: false
      });
    });
  });
}

async function main() {
  console.log('Loading onboarding movies...');
  const data = JSON.parse(fs.readFileSync(MOVIES_FILE, 'utf8'));
  const movies = data.movies;

  console.log(`\nValidating ${movies.length} movie posters...\n`);

  const results = [];

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const result = await checkPosterURL(movie.posterPath);
    results.push({
      ...result,
      movie: `${movie.title} (${movie.year})`
    });

    const status = result.valid ? '✅' : '❌';
    console.log(`${status} [${result.status}] ${movie.title} (${movie.year})`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  const valid = results.filter(r => r.valid).length;
  const invalid = results.filter(r => !r.valid).length;

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total movies: ${movies.length}`);
  console.log(`Valid posters: ${valid} (${Math.round(valid/movies.length*100)}%)`);
  console.log(`Invalid posters: ${invalid} (${Math.round(invalid/movies.length*100)}%)`);

  if (invalid > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('MOVIES WITH INVALID POSTERS');
    console.log('='.repeat(60));
    results.filter(r => !r.valid).forEach(r => {
      console.log(`- ${r.movie}`);
      console.log(`  Path: ${r.posterPath}`);
      console.log(`  Status: ${r.status}`);
    });
  }

  console.log('\n');
}

main().catch(console.error);
