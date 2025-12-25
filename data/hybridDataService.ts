/**
 * Hybrid Data Service
 * 
 * This service implements a three-tier fallback system:
 * 1. Try Azure API first
 * 2. If Azure fails, try local SQLite database
 * 3. If SQLite is empty, fall back to mock data
 * 
 * Also handles background synchronization between Azure and SQLite.
 */

import {
  Adventure,
  Adventurer,
  CompletedAdventure,
  CreateAdventure,
  CreateAdventurer,
  CreateCompletedAdventure,
  CreateLandmark,
  CreateRegion,
  CreateToken,
  Landmark,
  Region,
  Token,
  UpdateAdventurer
} from '@/types/database';
import { localDb } from './localDatabaseService';
import {
  readAdventurers,
  readAdventures,
  readAdventuresByAdventurer,
  readAdventuresByRegion,
  readCompletedAdventuresByAdventurer,
  readLandmarks,
  readLandmarksInRegion,
  readRegions,
  readTokens,
  readTokensInAdventure
} from './mockData';

// Configuration
const AZURE_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wayfind-api.azurewebsites.net';
const REQUEST_TIMEOUT = 5000; // 5 seconds

type DataSource = 'azure' | 'sqlite' | 'mock';

class HybridDataService {
  private initialized = false;
  private lastSyncTime: Date | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await localDb.initialize();
      this.initialized = true;
      console.log('Hybrid data service initialized');
    } catch (error) {
      console.error('Failed to initialize hybrid data service:', error);
      // Continue without SQLite - will use mock data as fallback
      this.initialized = true;
    }
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private async makeApiCall<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; source: DataSource }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${AZURE_API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Azure API call successful: ${endpoint}`);
      return { data, source: 'azure' };
    } catch (error) {
      clearTimeout(timeoutId);
      console.log(`❌ Azure API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  private async tryApiThenLocalThenMock<T>(
    apiCall: () => Promise<T>,
    localCall: () => Promise<T>,
    mockCall: () => T,
    entityName: string
  ): Promise<{ data: T; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const data = await apiCall();
      // Background sync to local database
      this.backgroundSync(entityName, data);
      return { data, source: 'azure' };
    } catch (apiError) {
      console.log(`Azure API failed for ${entityName}, trying local database`);
    }

    // Try SQLite database
    try {
      const data = await localCall();
      const hasData = Array.isArray(data) ? data.length > 0 : !!data;
      
      if (hasData) {
        console.log(`✅ Local SQLite data found for ${entityName}`);
        return { data, source: 'sqlite' };
      } else {
        console.log(`SQLite database empty for ${entityName}, using mock data`);
      }
    } catch (sqliteError) {
      console.log(`SQLite failed for ${entityName}, falling back to mock data:`, sqliteError);
    }

    // Fall back to mock data
    const data = mockCall();
    console.log(`📝 Using mock data for ${entityName}`);
    return { data, source: 'mock' };
  }

  private backgroundSync(entityName: string, data: any): void {
    // Run sync in background without blocking the main operation
    setTimeout(async () => {
      try {
        if (entityName === 'adventurers' && Array.isArray(data)) {
          // For now, we'll implement full sync later
          // This is just a placeholder for background sync logic
          console.log(`🔄 Background sync initiated for ${entityName}`);
        }
      } catch (error) {
        console.log(`Background sync failed for ${entityName}:`, error);
      }
    }, 100);
  }

  // ============================================================================
  // ADVENTURER OPERATIONS
  // ============================================================================

  async fetchAdventurers(): Promise<{ data: Adventurer[]; source: DataSource }> {
    return this.tryApiThenLocalThenMock(
      () => this.makeApiCall<Adventurer[]>('/adventurers').then(result => result.data),
      () => localDb.getAdventurers(),
      () => readAdventurers(),
      'adventurers'
    );
  }

  async createAdventurer(adventurerData: CreateAdventurer): Promise<{ data: Adventurer; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<Adventurer>('/adventurers', {
        method: 'POST',
        body: JSON.stringify(adventurerData),
      });
      
      // Also create in local database for offline access
      try {
        await localDb.createAdventurer(adventurerData);
      } catch (localError) {
        console.log('Failed to sync new adventurer to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for createAdventurer, trying local database');
      
      // Try local database
      try {
        const data = await localDb.createAdventurer(adventurerData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for creating adventurer');
      }
    }
  }

  async updateAdventurer(id: number, adventurerData: Omit<UpdateAdventurer, 'id'>): Promise<{ data: Adventurer; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<Adventurer>(`/adventurers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...adventurerData, id }),
      });
      
      // Also update in local database
      try {
        await localDb.updateAdventurer(id, adventurerData);
      } catch (localError) {
        console.log('Failed to sync adventurer update to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for updateAdventurer, trying local database');
      
      // Try local database
      try {
        const data = await localDb.updateAdventurer(id, adventurerData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for updating adventurer');
      }
    }
  }

  // ============================================================================
  // REGION OPERATIONS
  // ============================================================================

  async fetchRegions(): Promise<{ data: Region[]; source: DataSource }> {
    return this.tryApiThenLocalThenMock(
      () => this.makeApiCall<Region[]>('/regions').then(result => result.data),
      () => localDb.getRegions(),
      () => readRegions(),
      'regions'
    );
  }

  async createRegion(regionData: CreateRegion): Promise<{ data: Region; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<Region>('/regions', {
        method: 'POST',
        body: JSON.stringify(regionData),
      });
      
      // Also create in local database
      try {
        await localDb.createRegion(regionData);
      } catch (localError) {
        console.log('Failed to sync new region to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for createRegion, trying local database');
      
      // Try local database
      try {
        const data = await localDb.createRegion(regionData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for creating region');
      }
    }
  }

  // ============================================================================
  // LANDMARK OPERATIONS
  // ============================================================================

  async fetchLandmarks(regionId?: number | null): Promise<{ data: Landmark[]; source: DataSource }> {
    const endpoint = regionId ? `/landmarks?regionid=${regionId}` : '/landmarks';
    
    return this.tryApiThenLocalThenMock(
      () => this.makeApiCall<Landmark[]>(endpoint).then(result => result.data),
      () => localDb.getLandmarks(regionId || undefined),
      () => regionId ? readLandmarksInRegion(regionId) : readLandmarks(),
      'landmarks'
    );
  }

  async createLandmark(landmarkData: CreateLandmark): Promise<{ data: Landmark; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<Landmark>('/landmarks', {
        method: 'POST',
        body: JSON.stringify(landmarkData),
      });
      
      // Also create in local database
      try {
        await localDb.createLandmark(landmarkData);
      } catch (localError) {
        console.log('Failed to sync new landmark to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for createLandmark, trying local database');
      
      // Try local database
      try {
        const data = await localDb.createLandmark(landmarkData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for creating landmark');
      }
    }
  }

  // ============================================================================
  // ADVENTURE OPERATIONS
  // ============================================================================

  async fetchAdventures(regionId?: number | null, adventurerId?: number | null): Promise<{ data: Adventure[]; source: DataSource }> {
    let endpoint = '/adventures';
    const params = new URLSearchParams();
    if (regionId) params.append('regionid', regionId.toString());
    if (adventurerId) params.append('adventurerid', adventurerId.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;

    return this.tryApiThenLocalThenMock(
      () => this.makeApiCall<Adventure[]>(endpoint).then(result => result.data),
      () => localDb.getAdventures(regionId || undefined, adventurerId || undefined),
      () => {
        if (regionId) return readAdventuresByRegion(regionId);
        if (adventurerId) return readAdventuresByAdventurer(adventurerId);
        return readAdventures();
      },
      'adventures'
    );
  }

  async createAdventure(adventureData: CreateAdventure): Promise<{ data: Adventure; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<Adventure>('/adventures', {
        method: 'POST',
        body: JSON.stringify(adventureData),
      });
      
      // Also create in local database
      try {
        await localDb.createAdventure(adventureData);
      } catch (localError) {
        console.log('Failed to sync new adventure to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for createAdventure, trying local database');
      
      // Try local database
      try {
        const data = await localDb.createAdventure(adventureData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for creating adventure');
      }
    }
  }

  // ============================================================================
  // TOKEN OPERATIONS
  // ============================================================================

  async fetchTokens(adventureId?: number | null): Promise<{ data: Token[]; source: DataSource }> {
    const endpoint = adventureId ? `/tokens?adventureid=${adventureId}` : '/tokens';
    
    return this.tryApiThenLocalThenMock(
      () => this.makeApiCall<Token[]>(endpoint).then(result => result.data),
      () => localDb.getTokens(adventureId || undefined),
      () => adventureId ? readTokensInAdventure(adventureId) : readTokens(),
      'tokens'
    );
  }

  async createToken(tokenData: CreateToken): Promise<{ data: Token; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<Token>('/tokens', {
        method: 'POST',
        body: JSON.stringify(tokenData),
      });
      
      // Also create in local database
      try {
        await localDb.createToken(tokenData);
      } catch (localError) {
        console.log('Failed to sync new token to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for createToken, trying local database');
      
      // Try local database
      try {
        const data = await localDb.createToken(tokenData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for creating token');
      }
    }
  }

  // ============================================================================
  // COMPLETED ADVENTURE OPERATIONS
  // ============================================================================

  async fetchCompletedAdventures(adventurerId: number): Promise<{ data: CompletedAdventure[]; source: DataSource }> {
    const endpoint = `/completed-adventures?adventurerid=${adventurerId}`;
    
    return this.tryApiThenLocalThenMock(
      () => this.makeApiCall<CompletedAdventure[]>(endpoint).then(result => result.data),
      () => localDb.getCompletedAdventures(adventurerId),
      () => readCompletedAdventuresByAdventurer(adventurerId),
      'completedAdventures'
    );
  }

  async createCompletedAdventure(completionData: CreateCompletedAdventure): Promise<{ data: CompletedAdventure; source: DataSource }> {
    await this.initialize();

    // Try Azure API first
    try {
      const result = await this.makeApiCall<CompletedAdventure>('/completed-adventures', {
        method: 'POST',
        body: JSON.stringify(completionData),
      });
      
      // Also create in local database
      try {
        await localDb.createCompletedAdventure(completionData);
      } catch (localError) {
        console.log('Failed to sync completed adventure to local database:', localError);
      }
      
      return result;
    } catch (apiError) {
      console.log('Azure API failed for createCompletedAdventure, trying local database');
      
      // Try local database
      try {
        const data = await localDb.createCompletedAdventure(completionData);
        return { data, source: 'sqlite' };
      } catch (localError) {
        throw new Error('Both Azure API and local database failed for creating completed adventure');
      }
    }
  }

  // ============================================================================
  // SYNC AND UTILITY METHODS
  // ============================================================================

  async fullSync(): Promise<{ success: boolean; error?: string }> {
    await this.initialize();

    try {
      // Fetch all data from Azure API
      const [adventurers, regions, landmarks, adventures, tokens] = await Promise.all([
        this.makeApiCall<Adventurer[]>('/adventurers'),
        this.makeApiCall<Region[]>('/regions'),
        this.makeApiCall<Landmark[]>('/landmarks'),
        this.makeApiCall<Adventure[]>('/adventures'),
        this.makeApiCall<Token[]>('/tokens')
      ]);

      // Sync to local database
      await localDb.syncDataFromRemote({
        adventurers: adventurers.data,
        regions: regions.data,
        landmarks: landmarks.data,
        adventures: adventures.data,
        tokens: tokens.data
      });

      this.lastSyncTime = new Date();
      console.log('✅ Full sync completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  async getDataSourceStatus(): Promise<{
    azure: boolean;
    sqlite: boolean;
    mock: boolean;
  }> {
    await this.initialize();

    // Test Azure API
    let azureWorking = false;
    try {
      await this.makeApiCall<any>('/health');
      azureWorking = true;
    } catch {
      azureWorking = false;
    }

    // Test SQLite
    let sqliteWorking = false;
    try {
      await localDb.isDataAvailable();
      sqliteWorking = true;
    } catch {
      sqliteWorking = false;
    }

    return {
      azure: azureWorking,
      sqlite: sqliteWorking,
      mock: true // Mock data is always available
    };
  }
}

// Export singleton instance
export const hybridDataService = new HybridDataService();