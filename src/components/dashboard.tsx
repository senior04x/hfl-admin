'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mongodbService } from '@/lib/mongodbService';
import { realTimeService } from '@/lib/realTimeService';

interface DashboardStats {
  totalTeams: number;
  totalMatches: number;
  totalUsers: number;
  totalApplications: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalMatches: 0,
    totalUsers: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Setup real-time updates
    const setupRealTime = async () => {
      try {
        await realTimeService.connect();
        
        // Subscribe to updates
        const unsubscribeMatch = realTimeService.onMatchUpdate((match) => {
          console.log('Real-time match update:', match);
          fetchStats(); // Refresh stats
        });
        
        const unsubscribeTeam = realTimeService.onTeamUpdate((team) => {
          console.log('Real-time team update:', team);
          fetchStats(); // Refresh stats
        });
        
        const unsubscribeApplication = realTimeService.onApplicationUpdate((application) => {
          console.log('Real-time application update:', application);
          fetchStats(); // Refresh stats
        });
        
        // Cleanup on unmount
        return () => {
          unsubscribeMatch();
          unsubscribeTeam();
          unsubscribeApplication();
          realTimeService.disconnect();
        };
      } catch (error) {
        console.error('Real-time setup failed:', error);
      }
    };
    
    setupRealTime();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Use MongoDB API instead of Firebase
      const [teamsRes, matchesRes, playersRes, applicationsRes] = await Promise.all([
        mongodbService.getTeams(),
        mongodbService.getMatches(),
        mongodbService.getPlayers(),
        mongodbService.getApplications(),
      ]);

      setStats({
        totalTeams: teamsRes.success && Array.isArray(teamsRes.data) ? teamsRes.data.length : 0,
        totalMatches: matchesRes.success && Array.isArray(matchesRes.data) ? matchesRes.data.length : 0,
        totalUsers: playersRes.success && Array.isArray(playersRes.data) ? playersRes.data.length : 0,
        totalApplications: applicationsRes.success && Array.isArray(applicationsRes.data) ? applicationsRes.data.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mobile-padding">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="mobile-title text-gray-900">HFL Boshqaruv</h1>
          <p className="mobile-text text-gray-600 mt-2">Havas Football League boshqaruv tizimi</p>
        </div>

        <div className="mobile-grid mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jamoalar</CardTitle>
              <div className="h-4 w-4 text-blue-600">⚽</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Jami jamoa soni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">O'yinlar</CardTitle>
              <div className="h-4 w-4 text-green-600">🏆</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground">
                Jami o'yin soni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Foydalanuvchilar</CardTitle>
              <div className="h-4 w-4 text-purple-600">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Jami foydalanuvchi soni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arizalar</CardTitle>
              <div className="h-4 w-4 text-orange-600">📝</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Jami ariza soni
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mobile-grid lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tezkor Harakatlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mobile-space-y">
                <a 
                  href="/teams" 
                  className="mobile-card block hover:bg-gray-50 transition-colors"
                >
                  <h3 className="mobile-subtitle">Jamoalar</h3>
                  <p className="mobile-text text-gray-600">Jamoalarni boshqarish</p>
                </a>
                <a 
                  href="/matches" 
                  className="mobile-card block hover:bg-gray-50 transition-colors"
                >
                  <h3 className="mobile-subtitle">O'yinlar</h3>
                  <p className="mobile-text text-gray-600">O'yinlarni boshqarish</p>
                </a>
                <a 
                  href="/players" 
                  className="mobile-card block hover:bg-gray-50 transition-colors"
                >
                  <h3 className="mobile-subtitle">O'yinchilar</h3>
                  <p className="mobile-text text-gray-600">O'yinchilarni boshqarish</p>
                </a>
                <a 
                  href="/applications" 
                  className="mobile-card block hover:bg-gray-50 transition-colors"
                >
                  <h3 className="mobile-subtitle">Arizalar</h3>
                  <p className="mobile-text text-gray-600">Ligaga arizalarni ko'rish</p>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistika</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mobile-space-y">
                <div className="mobile-flex mobile-justify-between mobile-items-center">
                  <span className="mobile-text text-gray-600">Faol jamoalar</span>
                  <span className="mobile-text font-medium">{stats.totalTeams}</span>
                </div>
                <div className="mobile-flex mobile-justify-between mobile-items-center">
                  <span className="mobile-text text-gray-600">Rejalashtirilgan o'yinlar</span>
                  <span className="mobile-text font-medium">{stats.totalMatches}</span>
                </div>
                <div className="mobile-flex mobile-justify-between mobile-items-center">
                  <span className="mobile-text text-gray-600">Ro'yxatdan o'tgan foydalanuvchilar</span>
                  <span className="mobile-text font-medium">{stats.totalUsers}</span>
                </div>
                <div className="mobile-flex mobile-justify-between mobile-items-center">
                  <span className="mobile-text text-gray-600">Kutilayotgan arizalar</span>
                  <span className="mobile-text font-medium">{stats.totalApplications}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}