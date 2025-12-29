/**
 * Local SQLite Database Service
 * 
 * This service provides local database functionality using SQLite as a fallback
 * when the Azure web service is unavailable. It mirrors the same API structure
 * as the remote service for seamless integration.
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
  Point,
  Region,
  Token,
  UpdateAdventurer
} from '@/types/database';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'wayfind.db';

class LocalDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }
    
    if (!this.db) {
      this.initPromise = this.initialize();
      return this.initPromise;
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing SQLite database...');
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      console.log('Database opened, creating tables...');
      await this.createTables();
      console.log('Local database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      this.db = null;
      this.initPromise = null;
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      const createTableQueries = [
        // Drop tables in reverse order to handle foreign key constraints
        `DROP TABLE IF EXISTS CompletedAdventure;`,
        `DROP TABLE IF EXISTS Token;`,
        `DROP TABLE IF EXISTS Adventure;`,
        `DROP TABLE IF EXISTS Landmark;`,
        `DROP TABLE IF EXISTS Region;`,
        `DROP TABLE IF EXISTS Adventurer;`,

        // Create Adventurer table
        `CREATE TABLE IF NOT EXISTS Adventurer (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          profilePicture TEXT
        );`,

        // Create Region table
        `CREATE TABLE IF NOT EXISTS Region (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          adventurerID INTEGER,
          name TEXT NOT NULL,
          description TEXT,
          locationX REAL NOT NULL,
          locationY REAL NOT NULL,
          radius INTEGER NOT NULL,
          FOREIGN KEY (adventurerID) REFERENCES Adventurer(id)
        );`,

        // Create Landmark table
        `CREATE TABLE IF NOT EXISTS Landmark (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          regionID INTEGER,
          name TEXT NOT NULL,
          locationX REAL,
          locationY REAL,
          FOREIGN KEY (regionID) REFERENCES Region(id)
        );`,

        // Create Adventure table
        `CREATE TABLE IF NOT EXISTS Adventure (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          adventurerid INTEGER,
          regionid INTEGER,
          name TEXT NOT NULL,
          numTokens INTEGER,
          locationX REAL,
          locationY REAL,
          FOREIGN KEY (adventurerid) REFERENCES Adventurer(id),
          FOREIGN KEY (regionid) REFERENCES Region(id)
        );`,

        // Create Token table
        `CREATE TABLE IF NOT EXISTS Token (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          adventureid INTEGER,
          locationX REAL,
          locationY REAL,
          hint TEXT,
          tokenOrder INTEGER,
          FOREIGN KEY (adventureid) REFERENCES Adventure(id)
        );`,

        // Create CompletedAdventure table
        `CREATE TABLE IF NOT EXISTS CompletedAdventure (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          adventurerid INTEGER,
          adventureid INTEGER,
          completionDate TEXT,
          completionTime TEXT,
          FOREIGN KEY (adventurerid) REFERENCES Adventurer(id),
          FOREIGN KEY (adventureid) REFERENCES Adventure(id)
        );`
      ];

      for (const query of createTableQueries) {
        await this.db.execAsync(query);
      }
      
      console.log('All tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Helper function to convert Point to separate X,Y coordinates
  private pointToXY(point: Point): { x: number; y: number } {
    return { x: point.x, y: point.y };
  }

  // Helper function to convert X,Y coordinates to Point
  private xyToPoint(x: number | null, y: number | null): Point | null {
    if (x === null || y === null) return null;
    return { x, y };
  }

  // ============================================================================
  // ADVENTURER OPERATIONS
  // ============================================================================

  async getAdventurers(): Promise<Adventurer[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM Adventurer ORDER BY id
      `);
      
      return result.map((row: any) => ({
        id: row.id,
        username: row.username,
        password: row.password,
        profilepicture: row.profilePicture
      }));
    } catch (error) {
      console.error('Error getting adventurers:', error);
      throw error;
    }
  }

  async createAdventurer(data: CreateAdventurer): Promise<Adventurer> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.runAsync(
        `INSERT INTO Adventurer (username, password, profilePicture) VALUES (?, ?, ?)`,
        [data.username, data.password, data.profilepicture || null]
      );
      
      const newAdventurer: Adventurer = {
        id: result.lastInsertRowId,
        username: data.username,
        password: data.password,
        profilepicture: data.profilepicture
      };
      
      return newAdventurer;
    } catch (error) {
      console.error('Error creating adventurer:', error);
      throw error;
    }
  }

  async updateAdventurer(id: number, data: Omit<UpdateAdventurer, 'id'>): Promise<Adventurer> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const setParts = [];
      const values = [];
      
      if (data.username !== undefined) {
        setParts.push('username = ?');
        values.push(data.username);
      }
      if (data.password !== undefined) {
        setParts.push('password = ?');
        values.push(data.password);
      }
      if (data.profilepicture !== undefined) {
        setParts.push('profilePicture = ?');
        values.push(data.profilepicture);
      }
      
      values.push(id);
      
      await this.db.runAsync(
        `UPDATE Adventurer SET ${setParts.join(', ')} WHERE id = ?`,
        values
      );
      
      const result = await this.db.getFirstAsync(
        `SELECT * FROM Adventurer WHERE id = ?`,
        [id]
      ) as any;
      
      return {
        id: result.id,
        username: result.username,
        password: result.password,
        profilepicture: result.profilePicture
      };
    } catch (error) {
      console.error('Error updating adventurer:', error);
      throw error;
    }
  }

  // ============================================================================
  // REGION OPERATIONS
  // ============================================================================

  async getRegions(): Promise<Region[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM Region ORDER BY id
      `);
      
      return result.map((row: any) => ({
        id: row.id,
        adventurerid: row.adventurerID,
        name: row.name,
        description: row.description,
        location: this.xyToPoint(row.locationX, row.locationY)!,
        radius: row.radius
      }));
    } catch (error) {
      console.error('Error getting regions:', error);
      throw error;
    }
  }

  async createRegion(data: CreateRegion): Promise<Region> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const { x, y } = this.pointToXY(data.location);
      
      const result = await this.db.runAsync(
        `INSERT INTO Region (adventurerID, name, description, locationX, locationY, radius) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.adventurerid, data.name, data.description || null, x, y, data.radius]
      );
      
      const newRegion: Region = {
        id: result.lastInsertRowId,
        adventurerid: data.adventurerid,
        name: data.name,
        description: data.description,
        location: data.location,
        radius: data.radius
      };
      
      return newRegion;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  }

  // ============================================================================
  // LANDMARK OPERATIONS
  // ============================================================================

  async getLandmarks(regionId?: number): Promise<Landmark[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      let query = `SELECT * FROM Landmark`;
      let params: any[] = [];
      
      if (regionId) {
        query += ` WHERE regionID = ?`;
        params.push(regionId);
      }
      
      query += ` ORDER BY id`;
      
      const result = await this.db.getAllAsync(query, params);
      
      return result.map((row: any) => ({
        id: row.id,
        regionid: row.regionID,
        name: row.name,
        location: this.xyToPoint(row.locationX, row.locationY)
      }));
    } catch (error) {
      console.error('Error getting landmarks:', error);
      throw error;
    }
  }

  async createLandmark(data: CreateLandmark): Promise<Landmark> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const location = data.location ? this.pointToXY(data.location) : null;
      
      const result = await this.db.runAsync(
        `INSERT INTO Landmark (regionID, name, locationX, locationY) VALUES (?, ?, ?, ?)`,
        [data.regionid, data.name, location?.x || null, location?.y || null]
      );
      
      const newLandmark: Landmark = {
        id: result.lastInsertRowId,
        regionid: data.regionid,
        name: data.name,
        location: data.location
      };
      
      return newLandmark;
    } catch (error) {
      console.error('Error creating landmark:', error);
      throw error;
    }
  }

  // ============================================================================
  // ADVENTURE OPERATIONS
  // ============================================================================

  async getAdventures(regionId?: number, adventurerId?: number): Promise<Adventure[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      let query = `SELECT * FROM Adventure`;
      let params: any[] = [];
      let conditions: string[] = [];
      
      if (regionId) {
        conditions.push('regionid = ?');
        params.push(regionId);
      }
      
      if (adventurerId) {
        conditions.push('adventurerid = ?');
        params.push(adventurerId);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY id`;
      
      const result = await this.db.getAllAsync(query, params);
      
      return result.map((row: any) => ({
        id: row.id,
        adventurerid: row.adventurerid,
        regionid: row.regionid,
        name: row.name,
        numtokens: row.numTokens,
        location: this.xyToPoint(row.locationX, row.locationY)
      }));
    } catch (error) {
      console.error('Error getting adventures:', error);
      throw error;
    }
  }

  async createAdventure(data: CreateAdventure): Promise<Adventure> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const location = data.location ? this.pointToXY(data.location) : null;
      
      const result = await this.db.runAsync(
        `INSERT INTO Adventure (adventurerid, regionid, name, numTokens, locationX, locationY) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.adventurerid,
          data.regionid,
          data.name,
          data.numtokens || null,
          location?.x || null,
          location?.y || null
        ]
      );
      
      const newAdventure: Adventure = {
        id: result.lastInsertRowId,
        adventurerid: data.adventurerid,
        regionid: data.regionid,
        name: data.name,
        numtokens: data.numtokens,
        location: data.location
      };
      
      return newAdventure;
    } catch (error) {
      console.error('Error creating adventure:', error);
      throw error;
    }
  }

  // ============================================================================
  // TOKEN OPERATIONS
  // ============================================================================

  async getTokens(adventureId?: number): Promise<Token[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      let query = `SELECT * FROM Token`;
      let params: any[] = [];
      
      if (adventureId) {
        query += ` WHERE adventureid = ?`;
        params.push(adventureId);
      }
      
      query += ` ORDER BY tokenOrder, id`;
      
      const result = await this.db.getAllAsync(query, params);
      
      return result.map((row: any) => ({
        id: row.id,
        adventureid: row.adventureid,
        location: this.xyToPoint(row.locationX, row.locationY),
        hint: row.hint,
        tokenorder: row.tokenOrder
      }));
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  async createToken(data: CreateToken): Promise<Token> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const location = data.location ? this.pointToXY(data.location) : null;
      
      const result = await this.db.runAsync(
        `INSERT INTO Token (adventureid, locationX, locationY, hint, tokenOrder) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.adventureid,
          location?.x || null,
          location?.y || null,
          data.hint || null,
          data.tokenorder || null
        ]
      );
      
      const newToken: Token = {
        id: result.lastInsertRowId,
        adventureid: data.adventureid,
        location: data.location,
        hint: data.hint,
        tokenorder: data.tokenorder
      };
      
      return newToken;
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  // ============================================================================
  // COMPLETED ADVENTURE OPERATIONS
  // ============================================================================

  async getCompletedAdventures(adventurerId: number): Promise<CompletedAdventure[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      `SELECT * FROM CompletedAdventure WHERE adventurerid = ? ORDER BY id`,
      [adventurerId]
    );
    
    return result.map((row: any) => ({
      id: row.id,
      adventurerid: row.adventurerid,
      adventureid: row.adventureid,
      completiondate: row.completionDate,
      completiontime: row.completionTime
    }));
  }

  async createCompletedAdventure(data: CreateCompletedAdventure): Promise<CompletedAdventure> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      `INSERT INTO CompletedAdventure (adventurerid, adventureid, completionDate, completionTime) 
       VALUES (?, ?, ?, ?)`,
      [
        data.adventurerid,
        data.adventureid,
        data.completiondate || null,
        data.completiontime || null
      ]
    );
    
    const newCompletedAdventure: CompletedAdventure = {
      id: result.lastInsertRowId,
      adventurerid: data.adventurerid,
      adventureid: data.adventureid,
      completiondate: data.completiondate,
      completiontime: data.completiontime
    };
    
    return newCompletedAdventure;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    const tables = ['CompletedAdventure', 'Token', 'Adventure', 'Landmark', 'Region', 'Adventurer'];
    
    for (const table of tables) {
      await this.db.runAsync(`DELETE FROM ${table}`);
    }
  }

  async syncDataFromRemote(data: {
    adventurers?: Adventurer[];
    regions?: Region[];
    landmarks?: Landmark[];
    adventures?: Adventure[];
    tokens?: Token[];
    completedAdventures?: CompletedAdventure[];
  }): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Clear existing data
      await this.clearAllData();

      // Insert new data in dependency order
      if (data.adventurers) {
        for (const adventurer of data.adventurers) {
          await this.db.runAsync(
            `INSERT INTO Adventurer (id, username, password, profilePicture) VALUES (?, ?, ?, ?)`,
            [adventurer.id, adventurer.username, adventurer.password, adventurer.profilepicture || null]
          );
        }
      }

      if (data.regions) {
        for (const region of data.regions) {
          const { x, y } = this.pointToXY(region.location);
          await this.db.runAsync(
            `INSERT INTO Region (id, adventurerID, name, description, locationX, locationY, radius) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [region.id, region.adventurerid, region.name, region.description || null, x, y, region.radius]
          );
        }
      }

      if (data.landmarks) {
        for (const landmark of data.landmarks) {
          const location = landmark.location ? this.pointToXY(landmark.location) : null;
          await this.db.runAsync(
            `INSERT INTO Landmark (id, regionID, name, locationX, locationY) VALUES (?, ?, ?, ?, ?)`,
            [landmark.id, landmark.regionid, landmark.name, location?.x || null, location?.y || null]
          );
        }
      }

      if (data.adventures) {
        for (const adventure of data.adventures) {
          const location = adventure.location ? this.pointToXY(adventure.location) : null;
          await this.db.runAsync(
            `INSERT INTO Adventure (id, adventurerid, regionid, name, numTokens, locationX, locationY) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [adventure.id, adventure.adventurerid, adventure.regionid, adventure.name, adventure.numtokens || null, location?.x || null, location?.y || null]
          );
        }
      }

      if (data.tokens) {
        for (const token of data.tokens) {
          const location = token.location ? this.pointToXY(token.location) : null;
          await this.db.runAsync(
            `INSERT INTO Token (id, adventureid, locationX, locationY, hint, tokenOrder) VALUES (?, ?, ?, ?, ?, ?)`,
            [token.id, token.adventureid, location?.x || null, location?.y || null, token.hint || null, token.tokenorder || null]
          );
        }
      }

      if (data.completedAdventures) {
        for (const completed of data.completedAdventures) {
          await this.db.runAsync(
            `INSERT INTO CompletedAdventure (id, adventurerid, adventureid, completionDate, completionTime) VALUES (?, ?, ?, ?, ?)`,
            [completed.id, completed.adventurerid, completed.adventureid, completed.completiondate || null, completed.completiontime || null]
          );
        }
      }

      console.log('Data synced from remote to local database successfully');
    } catch (error) {
      console.error('Failed to sync data from remote:', error);
      throw error;
    }
  }

  async isDataAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      if (!this.db) return false;
    
      const result = await this.db.getFirstAsync(`SELECT COUNT(*) as count FROM Adventurer`) as any;
      return result.count > 0;
    } catch (error) {
      console.error('Error checking data availability:', error);
      return false;
    }
  }
}

// Export singleton instance
export const localDb = new LocalDatabaseService();