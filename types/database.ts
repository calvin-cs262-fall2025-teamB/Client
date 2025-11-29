/**
 * Database Types and Interfaces
 *
 * This file contains TypeScript interfaces that correspond to the PostgreSQL database schema.
 * These types ensure type safety when working with database operations and API responses.
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * PostgreSQL Point type (x, y coordinates)
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Geographic coordinates with latitude and longitude
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

// ============================================================================
// Database Entity Interfaces
// ============================================================================

/**
 * Adventurer entity - represents a user in the system
 */
export interface Adventurer {
  id: number;
  username: string;
  password: string;
  profilePicture?: string | null;
}

/**
 * Region entity - represents a geographic region containing adventures
 */
export interface Region {
  id: number;
  adventurerID: number;
  name: string;
  description?: string | null;
  location: Point;
  radius: number;
}

/**
 * Landmark entity - represents notable locations within a region
 */
export interface Landmark {
  id: number;
  regionID: number;
  name: string;
  location?: Point | null;
}

/**
 * Adventure entity - represents a treasure hunt adventure
 */
export interface Adventure {
  id: number;
  adventurerID: number;
  regionID: number;
  name: string;
  numTokens?: number | null;
  location?: Point | null;
}

/**
 * Token entity - represents collectible items within an adventure
 */
export interface Token {
  id: number;
  adventureID: number;
  location?: Point | null;
  hint?: string | null;
  tokenOrder?: number | null;
}

/**
 * CompletedAdventure entity - tracks completed adventures by users
 */
export interface CompletedAdventure {
  id: number;
  adventurerID: number;
  adventureId: number;
  completionDate?: string | null; // ISO date string
  completionTime?: string | null; // PostgreSQL interval as string
}

// ============================================================================
// Extended/Joined Types
// ============================================================================

/**
 * Adventure with related region information
 */
export interface AdventureWithRegion extends Adventure {
  region: Region;
}

/**
 * Adventure with tokens included
 */
export interface AdventureWithTokens extends Adventure {
  tokens: Token[];
}

/**
 * Complete adventure data with all related entities
 */
export interface AdventureComplete extends Adventure {
  region: Region;
  tokens: Token[];
  landmarks: Landmark[];
  creator: Adventurer;
}

/**
 * Region with associated landmarks and adventures
 */
export interface RegionWithDetails extends Region {
  landmarks: Landmark[];
  adventures: Adventure[];
}

/**
 * Adventurer profile with statistics
 */
export interface AdventurerProfile extends Adventurer {
  completedAdventures: CompletedAdventure[];
  createdAdventures: Adventure[];
  totalAdventuresCompleted: number;
  totalAdventuresCreated: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// Frontend-Specific Types
// ============================================================================

/**
 * Adventure data structure used by frontend components
 * (matches existing Adventure interface in components)
 */
export interface FrontendAdventure {
  id: string;
  title: string;
  summary: string;
  description: string;
  image_url: string | null;
  region: {
    id: string;
    name: string;
    center: Coordinates;
  };
  tokenCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  status: "draft" | "published" | "archived";
}

/**
 * User authentication data
 */
export interface AuthUser {
  id: number;
  username: string;
  profilePicture?: string | null;
  token?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  profilePicture?: string;
}

// ============================================================================
// Database Operation Types
// ============================================================================

/**
 * Create operations (omit auto-generated fields)
 */
export type CreateAdventurer = Omit<Adventurer, "id">;
export type CreateRegion = Omit<Region, "id">;
export type CreateLandmark = Omit<Landmark, "id">;
export type CreateAdventure = Omit<Adventure, "id">;
export type CreateToken = Omit<Token, "id">;
export type CreateCompletedAdventure = Omit<CompletedAdventure, "id">;

/**
 * Update operations (all fields optional except id)
 */
export type UpdateAdventurer = Partial<Adventurer> & { id: number };
export type UpdateRegion = Partial<Region> & { id: number };
export type UpdateLandmark = Partial<Landmark> & { id: number };
export type UpdateAdventure = Partial<Adventure> & { id: number };
export type UpdateToken = Partial<Token> & { id: number };
export type UpdateCompletedAdventure = Partial<CompletedAdventure> & {
  id: number;
};

// ============================================================================
// Query Parameters and Filters
// ============================================================================

/**
 * Adventure search and filter parameters
 */
export interface AdventureFilters {
  regionId?: number;
  adventurerId?: number;
  difficulty?: string;
  minTokens?: number;
  maxTokens?: number;
  searchQuery?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Geographic search parameters
 */
export interface LocationSearch {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Database operation errors
 */
export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Database entity names
 */
export type EntityType =
  | "adventurer"
  | "region"
  | "landmark"
  | "adventure"
  | "token"
  | "completedAdventure";

/**
 * CRUD operation types
 */
export type CrudOperation = "create" | "read" | "update" | "delete";

/**
 * Database connection status
 */
export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
