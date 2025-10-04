import { MongoClient, Db } from 'mongodb';

// HFL Database Configuration
const DATABASE_CONFIG = {
  DATABASE_NAME: 'hfl_football_league',
  COLLECTIONS: {
    PLAYERS: 'players',
    ADMINS: 'admins',
    TEAMS: 'teams',
    MATCHES: 'matches',
    LEAGUE_APPLICATIONS: 'leagueApplications',
    OTP_SESSIONS: 'otp_sessions',
    USER_SESSIONS: 'user_sessions',
    NOTIFICATIONS: 'notifications',
    SETTINGS: 'settings'
  }
};

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect(): Promise<boolean> {
    try {
      const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/hfl_football_league';
      
      this.client = new MongoClient(mongoUrl);
      await this.client.connect();
      this.db = this.client.db(DATABASE_CONFIG.DATABASE_NAME);
      this.isConnected = true;
      
      console.log('🗄️ MongoDB connected successfully (HFL-Admin)');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log('🗄️ MongoDB disconnected (HFL-Admin)');
      }
    } catch (error) {
      console.error('❌ MongoDB disconnect error:', error);
    }
  }

  getCollection(collectionName: string) {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db.collection(collectionName);
  }

  // Admin operations
  async getAdminByEmail(email: string) {
    try {
      const admins = this.getCollection(DATABASE_CONFIG.COLLECTIONS.ADMINS);
      const admin = await admins.findOne({ email: email });
      return admin;
    } catch (error) {
      console.error('❌ Error getting admin by email:', error);
      return null;
    }
  }

  async createAdmin(adminData: any) {
    try {
      const admins = this.getCollection(DATABASE_CONFIG.COLLECTIONS.ADMINS);
      const result = await admins.insertOne({
        ...adminData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: result.insertedId,
        ...adminData
      };
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      throw error;
    }
  }

  // Player operations (from mobile app)
  async getAllPlayers() {
    try {
      const players = this.getCollection(DATABASE_CONFIG.COLLECTIONS.PLAYERS);
      const result = await players.find({}).toArray();
      return result;
    } catch (error) {
      console.error('❌ Error getting all players:', error);
      return [];
    }
  }

  async getPlayerById(playerId: string) {
    try {
      const players = this.getCollection(DATABASE_CONFIG.COLLECTIONS.PLAYERS);
      const player = await players.findOne({ _id: playerId });
      return player;
    } catch (error) {
      console.error('❌ Error getting player by ID:', error);
      return null;
    }
  }

  async updatePlayer(playerId: string, updateData: any) {
    try {
      const players = this.getCollection(DATABASE_CONFIG.COLLECTIONS.PLAYERS);
      const result = await players.updateOne(
        { _id: playerId },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('❌ Error updating player:', error);
      return false;
    }
  }

  // Team operations
  async getAllTeams() {
    try {
      const teams = this.getCollection(DATABASE_CONFIG.COLLECTIONS.TEAMS);
      const result = await teams.find({}).toArray();
      return result;
    } catch (error) {
      console.error('❌ Error getting all teams:', error);
      return [];
    }
  }

  async createTeam(teamData: any) {
    try {
      const teams = this.getCollection(DATABASE_CONFIG.COLLECTIONS.TEAMS);
      const result = await teams.insertOne({
        ...teamData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: result.insertedId,
        ...teamData
      };
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }
  }

  // Match operations
  async getAllMatches() {
    try {
      const matches = this.getCollection(DATABASE_CONFIG.COLLECTIONS.MATCHES);
      const result = await matches.find({}).sort({ date: -1 }).toArray();
      return result;
    } catch (error) {
      console.error('❌ Error getting all matches:', error);
      return [];
    }
  }

  async createMatch(matchData: any) {
    try {
      const matches = this.getCollection(DATABASE_CONFIG.COLLECTIONS.MATCHES);
      const result = await matches.insertOne({
        ...matchData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: result.insertedId,
        ...matchData
      };
    } catch (error) {
      console.error('❌ Error creating match:', error);
      throw error;
    }
  }

  // League Applications
  async getAllLeagueApplications() {
    try {
      const applications = this.getCollection(DATABASE_CONFIG.COLLECTIONS.LEAGUE_APPLICATIONS);
      const result = await applications.find({}).sort({ createdAt: -1 }).toArray();
      return result;
    } catch (error) {
      console.error('❌ Error getting league applications:', error);
      return [];
    }
  }

  async updateLeagueApplication(appId: string, updateData: any) {
    try {
      const applications = this.getCollection(DATABASE_CONFIG.COLLECTIONS.LEAGUE_APPLICATIONS);
      const result = await applications.updateOne(
        { _id: appId },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('❌ Error updating league application:', error);
      return false;
    }
  }
}

// Export singleton instance
const mongoService = new MongoDBService();
export default mongoService;
