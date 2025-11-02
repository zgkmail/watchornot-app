#!/usr/bin/env node

/**
 * Test script for the cleanMovieTitle function
 * Run with: node test-text-cleaning.js
 */

const cleanMovieTitle = (rawText) => {
    console.log('🧹 Cleaning detected text...');
    console.log('Raw text:', rawText);

    if (!rawText || rawText.trim().length === 0) {
        return null;
    }

    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log('Lines found:', lines.length);
    console.log('Lines:', lines);

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

        cleaned = cleaned.replace(/^[#@$%^&*]+/, '');
        cleaned = cleaned.replace(/^\d+$/, '');
        cleaned = cleaned.replace(/^[+\-×x]$/, '');
        cleaned = cleaned.replace(/^\d{4}$/, '');
        cleaned = cleaned.replace(/^\d+h?\s*\d*m?$/, '');
        cleaned = cleaned.replace(/^[0-9.,]+$/, '');

        const lowerCleaned = cleaned.toLowerCase();
        if (uiNoise.some(noise => lowerCleaned === noise)) {
            return '';
        }

        if (cleaned.replace(/[a-zA-Z0-9]/g, '').length > cleaned.length * 0.5) {
            return '';
        }

        if (cleaned.length <= 1) {
            return '';
        }

        return cleaned.trim();
    }).filter(line => line.length > 0);

    console.log('Cleaned lines:', cleanedLines);

    if (cleanedLines.length === 0) {
        console.log('⚠️  No clean text remaining after filtering');
        return null;
    }

    let title = cleanedLines[0];

    if (title.length < 3 && cleanedLines.length > 1) {
        title = cleanedLines[0] + ' ' + cleanedLines[1];
    }

    title = title
        .replace(/[#@$%^&*_+=|\\<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    console.log('✨ Extracted title:', title);
    return title || null;
};

// Test cases
const testCases = [
    {
        name: "Your Actual Example (The Martian)",
        input: `#MARTIAN
D
Play
+
2
3374
Х
2015 2h 22m HD AD
PG-13 some strong language, injury images, and brief nu...`
    },
    {
        name: "Netflix Interface",
        input: `STRANGER THINGS
Play
S4:E1 Chapter One: The Hellfire Club
2022 | TV-14`
    },
    {
        name: "Simple Title Card",
        input: `INCEPTION`
    },
    {
        name: "Movie Poster",
        input: `THE DARK KNIGHT
COMING SOON`
    },
    {
        name: "Prime Video Interface",
        input: `The Lord of the Rings: The Fellowship of the Ring
Watch Now
Add to Watchlist
2001 2h 58m UHD`
    }
];

// Run tests
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  TEXT CLEANING FUNCTION TEST                           ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

testCases.forEach((testCase, index) => {
    console.log('\n' + '═'.repeat(60));
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log('═'.repeat(60));

    console.log('\n📄 RAW INPUT:');
    console.log(testCase.input);
    console.log('\n');

    const cleaned = cleanMovieTitle(testCase.input);

    console.log('\n✅ RESULT:', cleaned ? `"${cleaned}"` : '(null - failed to extract)');
    console.log('═'.repeat(60));
});

console.log('\n\n✨ All tests complete!\n');
