/**
 * WatchOrNot API Contracts
 *
 * These TypeScript interfaces define the API contracts between:
 * - Backend (Node.js/Express)
 * - Web frontend (React)
 * - iOS frontend (SwiftUI)
 *
 * Use these as reference to generate Swift models for iOS.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T> {
  status?: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Movie Types
// ============================================================================

export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  directors: string[];
  cast: string[];
  poster?: string;
  plot?: string;
  imdbRating?: number;
  runtime?: string;
  imdbId?: string;
}

export interface MovieDetails extends Movie {
  rated?: string;
  released?: string;
  writer?: string;
  awards?: string;
  metascore?: string;
  imdbVotes?: string;
  boxOffice?: string;
  production?: string;
  website?: string;
}

// ============================================================================
// Claude Vision API
// ============================================================================

export interface ClaudeImageAnalysisRequest {
  imageBase64: string;
  mimeType: string;
}

export interface ClaudeImageAnalysisResponse {
  success: boolean;
  data?: {
    title: string;
    year?: number;
    confidence?: string;
    reasoning?: string;
  };
  error?: string;
  rateLimitRemaining?: number;
}

// ============================================================================
// Onboarding
// ============================================================================

export interface OnboardingMovie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  directors: string[];
  cast: string[];
  poster: string;
  imdbRating: number;
}

export interface OnboardingMoviesResponse {
  movies: OnboardingMovie[];
}

export interface VoteRequest {
  movieId: string;
  vote: 'up' | 'down' | 'skip';
  title: string;
  year: number;
  genres: string[];
  directors: string[];
  cast: string[];
}

export interface VoteResponse {
  success: boolean;
  message: string;
  totalVotes?: number;
  onboardingComplete?: boolean;
}

export interface OnboardingStatusResponse {
  hasCompletedOnboarding: boolean;
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  skips: number;
}

// ============================================================================
// Recommendations
// ============================================================================

export type BadgeType =
  | 'genre_match'
  | 'director_match'
  | 'cast_match'
  | 'highly_rated'
  | 'hidden_gem'
  | 'cult_classic'
  | 'award_winner';

export interface Badge {
  type: BadgeType;
  label: string;
  reason: string;
}

export interface RecommendedMovie extends Movie {
  badges: Badge[];
  matchScore?: number;
  recommendationReason?: string;
}

export interface RecommendationsResponse {
  movies: RecommendedMovie[];
  totalCount: number;
  hasMore: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  favoriteGenres: string[];
  favoriteDirectors: string[];
  favoriteCast: string[];
  averageRatingThreshold: number;
}

// ============================================================================
// User Profile & Stats
// ============================================================================

export type UserTier =
  | 'newcomer'
  | 'enthusiast'
  | 'cinephile'
  | 'critic'
  | 'master';

export interface UserStats {
  tier: UserTier;
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  skips: number;
  moviesSnapped: number;
  onboardingComplete: boolean;
  joinedDate?: string;
  nextTierVotes?: number;
}

export interface UserStatsResponse {
  stats: UserStats;
}

// ============================================================================
// History
// ============================================================================

export interface HistoryEntry {
  id: number;
  movieId: string;
  title: string;
  year: number;
  vote: 'up' | 'down' | 'skip';
  timestamp: string;
  poster?: string;
  genres?: string[];
}

export interface HistoryResponse {
  history: HistoryEntry[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DeleteHistoryRequest {
  entryId: number;
}

export interface DeleteHistoryResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// TMDB Search
// ============================================================================

export interface TMDBSearchRequest {
  title: string;
  year?: number;
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  year: number;
  overview: string;
  posterPath?: string;
  voteAverage: number;
  popularity: number;
}

export interface TMDBSearchResponse {
  results: TMDBSearchResult[];
  totalResults: number;
}

// ============================================================================
// OMDb Details
// ============================================================================

export interface OMDbDetailsRequest {
  imdbId?: string;
  title?: string;
  year?: number;
}

export interface OMDbDetailsResponse extends MovieDetails {
  source: 'omdb';
}

// ============================================================================
// Session & Auth
// ============================================================================

export interface SessionInfo {
  sessionId: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SessionResponse {
  session: SessionInfo;
  user?: UserStats;
}

// ============================================================================
// Error Response
// ============================================================================

export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
