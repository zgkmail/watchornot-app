const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Test database path (in backend/db directory)
const TEST_DB_PATH = path.join(__dirname, 'db', 'test-cinesense.db');

/**
 * Create a fresh test database
 */
function createTestDatabase() {
  // Ensure db directory exists
  const dbDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Remove existing test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movie_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      title TEXT NOT NULL,
      genre TEXT,
      year TEXT,
      imdb_rating REAL,
      rotten_tomatoes INTEGER,
      metacritic INTEGER,
      poster TEXT,
      director TEXT,
      cast TEXT,
      rating TEXT CHECK(rating IN ('up', 'down')),
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, movie_id)
    );

    CREATE TABLE IF NOT EXISTS movie_genre_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      genre TEXT NOT NULL,
      UNIQUE(user_id, movie_id, genre)
    );

    CREATE TABLE IF NOT EXISTS user_genre_preferences (
      user_id TEXT NOT NULL,
      genre TEXT NOT NULL,
      thumbs_up INTEGER DEFAULT 0,
      thumbs_down INTEGER DEFAULT 0,
      avg_imdb_rating REAL,
      last_updated INTEGER,
      PRIMARY KEY (user_id, genre),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_director_preferences (
      user_id TEXT NOT NULL,
      director TEXT NOT NULL,
      thumbs_up INTEGER DEFAULT 0,
      thumbs_down INTEGER DEFAULT 0,
      avg_imdb_rating REAL,
      last_updated INTEGER,
      PRIMARY KEY (user_id, director),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_cast_preferences (
      user_id TEXT NOT NULL,
      cast_member TEXT NOT NULL,
      thumbs_up INTEGER DEFAULT 0,
      thumbs_down INTEGER DEFAULT 0,
      avg_imdb_rating REAL,
      last_updated INTEGER,
      PRIMARY KEY (user_id, cast_member),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return db;
}

/**
 * Clean up test database
 */
function cleanupTestDatabase() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

/**
 * Sample movie data fixtures
 */
const SAMPLE_MOVIES = [
  {
    id: '27205',
    title: 'Inception',
    genre: 'Action, Science Fiction, Thriller',
    year: '2010',
    imdb_rating: 8.8,
    rotten_tomatoes: 87,
    metacritic: 74,
    poster: '/inception-poster.jpg',
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Tom Hardy, Ellen Page'
  },
  {
    id: '550',
    title: 'Fight Club',
    genre: 'Drama, Thriller',
    year: '1999',
    imdb_rating: 8.8,
    rotten_tomatoes: 79,
    metacritic: 66,
    poster: '/fight-club-poster.jpg',
    director: 'David Fincher',
    cast: 'Brad Pitt, Edward Norton, Helena Bonham Carter'
  },
  {
    id: '13',
    title: 'Forrest Gump',
    genre: 'Comedy, Drama, Romance',
    year: '1994',
    imdb_rating: 8.8,
    rotten_tomatoes: 71,
    metacritic: 82,
    poster: '/forrest-gump-poster.jpg',
    director: 'Robert Zemeckis',
    cast: 'Tom Hanks, Robin Wright, Gary Sinise'
  },
  {
    id: '155',
    title: 'The Dark Knight',
    genre: 'Action, Crime, Drama',
    year: '2008',
    imdb_rating: 9.0,
    rotten_tomatoes: 94,
    metacritic: 84,
    poster: '/dark-knight-poster.jpg',
    director: 'Christopher Nolan',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart'
  },
  {
    id: '238',
    title: 'The Godfather',
    genre: 'Crime, Drama',
    year: '1972',
    imdb_rating: 9.2,
    rotten_tomatoes: 97,
    metacritic: 100,
    poster: '/godfather-poster.jpg',
    director: 'Francis Ford Coppola',
    cast: 'Marlon Brando, Al Pacino, James Caan'
  },
  {
    id: '680',
    title: 'Pulp Fiction',
    genre: 'Crime, Drama, Thriller',
    year: '1994',
    imdb_rating: 8.9,
    rotten_tomatoes: 92,
    metacritic: 94,
    poster: '/pulp-fiction-poster.jpg',
    director: 'Quentin Tarantino',
    cast: 'John Travolta, Uma Thurman, Samuel L. Jackson'
  },
  {
    id: '424',
    title: "Schindler's List",
    genre: 'Drama, History, War',
    year: '1993',
    imdb_rating: 9.0,
    rotten_tomatoes: 98,
    metacritic: 95,
    poster: '/schindlers-list-poster.jpg',
    director: 'Steven Spielberg',
    cast: 'Liam Neeson, Ralph Fiennes, Ben Kingsley'
  },
  {
    id: '122',
    title: 'The Lord of the Rings: The Return of the King',
    genre: 'Action, Adventure, Fantasy',
    year: '2003',
    imdb_rating: 9.0,
    rotten_tomatoes: 93,
    metacritic: 94,
    poster: '/lotr-rotk-poster.jpg',
    director: 'Peter Jackson',
    cast: 'Elijah Wood, Viggo Mortensen, Ian McKellen'
  },
  {
    id: '497',
    title: 'The Green Mile',
    genre: 'Crime, Drama, Fantasy',
    year: '1999',
    imdb_rating: 8.6,
    rotten_tomatoes: 78,
    metacritic: 61,
    poster: '/green-mile-poster.jpg',
    director: 'Frank Darabont',
    cast: 'Tom Hanks, Michael Clarke Duncan, David Morse'
  },
  {
    id: '120',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    genre: 'Action, Adventure, Fantasy',
    year: '2001',
    imdb_rating: 8.8,
    rotten_tomatoes: 91,
    metacritic: 92,
    poster: '/lotr-fotr-poster.jpg',
    director: 'Peter Jackson',
    cast: 'Elijah Wood, Ian McKellen, Orlando Bloom'
  },
  {
    id: '769',
    title: 'GoodFellas',
    genre: 'Crime, Drama',
    year: '1990',
    imdb_rating: 8.7,
    rotten_tomatoes: 96,
    metacritic: 91,
    poster: '/goodfellas-poster.jpg',
    director: 'Martin Scorsese',
    cast: 'Robert De Niro, Ray Liotta, Joe Pesci'
  },
  {
    id: '524',
    title: 'Casino',
    genre: 'Crime, Drama',
    year: '1995',
    imdb_rating: 8.2,
    rotten_tomatoes: 80,
    metacritic: 73,
    poster: '/casino-poster.jpg',
    director: 'Martin Scorsese',
    cast: 'Robert De Niro, Sharon Stone, Joe Pesci'
  },
  {
    id: '19404',
    title: 'Dilwale Dulhania Le Jayenge',
    genre: 'Comedy, Drama, Romance',
    year: '1995',
    imdb_rating: 8.1,
    rotten_tomatoes: 89,
    metacritic: null,
    poster: '/ddlj-poster.jpg',
    director: 'Aditya Chopra',
    cast: 'Shah Rukh Khan, Kajol, Amrish Puri'
  },
  {
    id: '389',
    title: '12 Angry Men',
    genre: 'Drama',
    year: '1957',
    imdb_rating: 9.0,
    rotten_tomatoes: 100,
    metacritic: 97,
    poster: '/12-angry-men-poster.jpg',
    director: 'Sidney Lumet',
    cast: 'Henry Fonda, Lee J. Cobb, Martin Balsam'
  },
  {
    id: '105',
    title: 'Back to the Future',
    genre: 'Adventure, Comedy, Science Fiction',
    year: '1985',
    imdb_rating: 8.5,
    rotten_tomatoes: 96,
    metacritic: 87,
    poster: '/back-to-future-poster.jpg',
    director: 'Robert Zemeckis',
    cast: 'Michael J. Fox, Christopher Lloyd, Lea Thompson'
  },
  {
    id: '603',
    title: 'The Matrix',
    genre: 'Action, Science Fiction',
    year: '1999',
    imdb_rating: 8.7,
    rotten_tomatoes: 88,
    metacritic: 73,
    poster: '/matrix-poster.jpg',
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss'
  },
  {
    id: '244',
    title: 'The Departed',
    genre: 'Crime, Drama, Thriller',
    year: '2006',
    imdb_rating: 8.5,
    rotten_tomatoes: 90,
    metacritic: 85,
    poster: '/departed-poster.jpg',
    director: 'Martin Scorsese',
    cast: 'Leonardo DiCaprio, Matt Damon, Jack Nicholson'
  },
  {
    id: '637',
    title: 'Life Is Beautiful',
    genre: 'Comedy, Drama, Romance',
    year: '1997',
    imdb_rating: 8.6,
    rotten_tomatoes: 80,
    metacritic: 59,
    poster: '/life-is-beautiful-poster.jpg',
    director: 'Roberto Benigni',
    cast: 'Roberto Benigni, Nicoletta Braschi, Giorgio Cantarini'
  },
  {
    id: '857',
    title: 'Saving Private Ryan',
    genre: 'Drama, History, War',
    year: '1998',
    imdb_rating: 8.6,
    rotten_tomatoes: 93,
    metacritic: 91,
    poster: '/saving-private-ryan-poster.jpg',
    director: 'Steven Spielberg',
    cast: 'Tom Hanks, Tom Sizemore, Edward Burns'
  },
  {
    id: '630',
    title: 'The Usual Suspects',
    genre: 'Crime, Drama, Thriller',
    year: '1995',
    imdb_rating: 8.5,
    rotten_tomatoes: 89,
    metacritic: 77,
    poster: '/usual-suspects-poster.jpg',
    director: 'Bryan Singer',
    cast: 'Kevin Spacey, Gabriel Byrne, Chazz Palminteri'
  }
];

/**
 * Create a test movie with customizable properties
 */
function createTestMovie(overrides = {}) {
  const defaults = {
    id: `${Math.floor(Math.random() * 100000)}`,
    title: `Test Movie ${Math.floor(Math.random() * 1000)}`,
    genre: 'Action, Drama',
    year: '2020',
    imdb_rating: 7.5,
    rotten_tomatoes: 75,
    metacritic: 70,
    poster: '/test-poster.jpg',
    director: 'Test Director',
    cast: 'Actor One, Actor Two, Actor Three',
    rating: 'up',
    timestamp: Date.now()
  };

  return { ...defaults, ...overrides };
}

/**
 * Get a random sample movie
 */
function getRandomSampleMovie() {
  return { ...SAMPLE_MOVIES[Math.floor(Math.random() * SAMPLE_MOVIES.length)] };
}

/**
 * Seed the database with multiple movies for a user
 */
function seedMovies(db, userId, count = 10, rating = null) {
  const stmt = db.prepare(`
    INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const movies = [];
  const usedIds = new Set();

  for (let i = 0; i < count; i++) {
    let movie;

    // Use sample movies if available, otherwise create random ones
    if (i < SAMPLE_MOVIES.length && !usedIds.has(SAMPLE_MOVIES[i].id)) {
      movie = { ...SAMPLE_MOVIES[i] };
      usedIds.add(movie.id);
    } else {
      movie = createTestMovie();
      while (usedIds.has(movie.id)) {
        movie = createTestMovie();
      }
      usedIds.add(movie.id);
    }

    // Set rating if specified, otherwise alternate
    if (rating) {
      movie.rating = rating;
    } else {
      movie.rating = i % 2 === 0 ? 'up' : 'down';
    }

    movie.timestamp = Date.now() - (count - i) * 1000; // Spread timestamps

    stmt.run(
      userId,
      movie.id,
      movie.title,
      movie.genre,
      movie.year,
      movie.imdb_rating,
      movie.rotten_tomatoes,
      movie.metacritic,
      movie.poster,
      movie.director,
      movie.cast,
      movie.rating,
      movie.timestamp
    );

    movies.push(movie);
  }

  return movies;
}

/**
 * Create a test user
 */
function createTestUser(db, userId = 'test-user-123', username = 'testuser') {
  const stmt = db.prepare(`
    INSERT INTO users (id, username, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(userId, username, 'test-hash', Date.now());

  return { id: userId, username };
}

/**
 * Mock TMDB API response for search
 */
function mockTMDBSearchResponse(movie) {
  return {
    page: 1,
    results: [
      {
        adult: false,
        backdrop_path: '/backdrop.jpg',
        genre_ids: [28, 12, 878],
        id: parseInt(movie.id),
        original_language: 'en',
        original_title: movie.title,
        overview: `This is the overview for ${movie.title}`,
        popularity: 100.0,
        poster_path: movie.poster,
        release_date: `${movie.year}-01-01`,
        title: movie.title,
        video: false,
        vote_average: movie.imdb_rating,
        vote_count: 1000
      }
    ],
    total_pages: 1,
    total_results: 1
  };
}

/**
 * Mock TMDB API response for movie details
 */
function mockTMDBMovieDetailsResponse(movie) {
  return {
    adult: false,
    backdrop_path: '/backdrop.jpg',
    belongs_to_collection: null,
    budget: 100000000,
    genres: movie.genre.split(', ').map((g, i) => ({ id: i + 1, name: g })),
    homepage: '',
    id: parseInt(movie.id),
    imdb_id: `tt${movie.id}`,
    original_language: 'en',
    original_title: movie.title,
    overview: `This is the overview for ${movie.title}`,
    popularity: 100.0,
    poster_path: movie.poster,
    production_companies: [],
    production_countries: [],
    release_date: `${movie.year}-01-01`,
    revenue: 200000000,
    runtime: 120,
    spoken_languages: [],
    status: 'Released',
    tagline: `The tagline for ${movie.title}`,
    title: movie.title,
    video: false,
    vote_average: movie.imdb_rating,
    vote_count: 1000,
    credits: {
      cast: movie.cast.split(', ').map((name, i) => ({
        adult: false,
        gender: 2,
        id: i + 1000,
        known_for_department: 'Acting',
        name,
        original_name: name,
        popularity: 50.0,
        profile_path: `/profile${i}.jpg`,
        cast_id: i,
        character: `Character ${i}`,
        credit_id: `credit${i}`,
        order: i
      })),
      crew: [
        {
          adult: false,
          gender: 2,
          id: 1,
          known_for_department: 'Directing',
          name: movie.director,
          original_name: movie.director,
          popularity: 100.0,
          profile_path: '/director.jpg',
          credit_id: 'director1',
          department: 'Directing',
          job: 'Director'
        }
      ]
    },
    external_ids: {
      imdb_id: `tt${movie.id}`,
      facebook_id: null,
      instagram_id: null,
      twitter_id: null
    }
  };
}

module.exports = {
  TEST_DB_PATH,
  createTestDatabase,
  cleanupTestDatabase,
  createTestMovie,
  getRandomSampleMovie,
  seedMovies,
  createTestUser,
  mockTMDBSearchResponse,
  mockTMDBMovieDetailsResponse,
  SAMPLE_MOVIES
};
