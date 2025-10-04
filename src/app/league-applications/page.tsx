'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Check, X, RefreshCw, User, Users } from 'lucide-react';
import { onSnapshot, collection, query, orderBy, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface LeagueApplication {
  id: string;
  type: 'player' | 'team';
  firstName?: string;
  lastName?: string;
  phone: string;
  password?: string;
  email?: string;
  position?: string;
  number?: number;
  photo?: string;
  teamId?: string;
  teamName?: string;
  foundedDate?: string;
  teamColor?: string;
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const LeagueApplicationsPage = () => {
  const [applications, setApplications] = useState<LeagueApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<LeagueApplication | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      // League applications
      const leagueApplicationsQuery = query(
        collection(db, 'leagueApplications'),
        orderBy('createdAt', 'desc')
      );
      
      unsubscribe = onSnapshot(leagueApplicationsQuery, (snapshot) => {
        const applicationsData: LeagueApplication[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          applicationsData.push({
            id: doc.id,
            type: data.type || 'player',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            password: data.password || '',
            email: data.email || '',
            position: data.position || '',
            number: data.number || 0,
            photo: data.photo || '',
            teamId: data.teamId || '',
            teamName: data.teamName || '',
            foundedDate: data.foundedDate || '',
            teamColor: data.teamColor || '',
            description: data.description || '',
            contactPerson: data.contactPerson || '',
            contactPhone: data.contactPhone || '',
            contactEmail: data.contactEmail || '',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });
        
        console.log('League applications fetched:', applicationsData);
        setApplications(applicationsData);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to league applications:', error);
        toast.error('Arizalar yuklanmadi');
        setLoading(false);
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      console.log('Updating league application:', id, 'to status:', status);
      
      const application = applications.find(app => app.id === id);
      if (!application) {
        toast.error('Ariza topilmadi');
        return;
      }

      // Update application status
      const applicationRef = doc(db, 'leagueApplications', id);
      await updateDoc(applicationRef, {
        status: status,
        updatedAt: new Date(),
      });
      
      // If approved, add to respective collections
      if (status === 'approved') {
        if (application.type === 'player') {
          // Add player to players collection
          const playerData = {
            firstName: application.firstName || '',
            lastName: application.lastName || '',
            phone: application.phone,
            password: application.password || '',
            email: application.email || '',
            photo: application.photo || '',
            teamId: application.teamId || '',
            teamName: application.teamName || '',
            position: application.position || '',
            number: application.number || 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const playerRef = await addDoc(collection(db, 'players'), playerData);
          console.log('Player added with ID:', playerRef.id);

          // Add player to standings
          const standingData = {
            playerId: playerRef.id,
            teamId: application.teamId || '',
            teamName: application.teamName || '',
            playerName: `${application.firstName} ${application.lastName}`,
            goals: 0,
            assists: 0,
            matchesPlayed: 0,
            yellowCards: 0,
            redCards: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await addDoc(collection(db, 'standings'), standingData);
          console.log('Player added to standings');

          // Add player stats
          const playerStatsData = {
            playerId: playerRef.id,
            teamId: application.teamId || '',
            teamName: application.teamName || '',
            goals: 0,
            assists: 0,
            matchesPlayed: 0,
            yellowCards: 0,
            redCards: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await addDoc(collection(db, 'playerStats'), playerStatsData);
          console.log('Player stats created');

          toast.success('O\'yinchi muvaffaqiyatli qo\'shildi!');
        } else if (application.type === 'team') {
          // Add team to teams collection
          const teamData = {
            name: application.teamName || '',
            logo: application.photo || '',
            color: application.teamColor || '#3B82F6',
            description: application.description || '',
            foundedDate: application.foundedDate || '',
            contactPerson: application.contactPerson || '',
            contactPhone: application.contactPhone || '',
            contactEmail: application.contactEmail || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const teamRef = await addDoc(collection(db, 'teams'), teamData);
          console.log('Team added with ID:', teamRef.id);

          toast.success('Jamoa muvaffaqiyatli qo\'shildi!');
        }
      }
      
      console.log('League application updated successfully');
      toast.success(`Ariza ${status === 'approved' ? 'tasdiqlandi' : 'rad etildi'}`);
      
    } catch (error: any) {
      console.error('Error updating league application:', error);
      toast.error(`Ariza yangilashda xatolik: ${error.message}`);
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        (app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (app.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        app.phone.includes(searchTerm)
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Tasdiqlangan';
      case 'rejected': return 'Rad etilgan';
      case 'pending': return 'Kutilmoqda';
      default: return 'Noma\'lum';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Arizalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Liga Arizalari</h1>
          <p className="text-gray-600">O'yinchi va jamoa arizalarini boshqaring</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Ariza qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ariza turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha turlar</SelectItem>
              <SelectItem value="player">O'yinchi</SelectItem>
              <SelectItem value="team">Jamoa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha statuslar</SelectItem>
              <SelectItem value="pending">Kutilmoqda</SelectItem>
              <SelectItem value="approved">Tasdiqlangan</SelectItem>
              <SelectItem value="rejected">Rad etilgan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredApplications().length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Arizalar topilmadi</p>
            <p className="text-gray-400">Qidiruv shartlarini o'zgartiring</p>
          </div>
        ) : (
          getFilteredApplications().map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {application.type === 'player' ? (
                      <User className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Users className="h-8 w-8 text-green-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {application.type === 'player' 
                          ? `${application.firstName} ${application.lastName}`
                          : application.teamName
                        }
                      </CardTitle>
                      <p className="text-sm text-gray-600">{application.phone}</p>
                      {application.type === 'player' && (
                        <p className="text-sm text-gray-500">{application.teamName}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusText(application.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ariza turi:</span>
                    <span className="text-sm font-medium">
                      {application.type === 'player' ? 'O\'yinchi' : 'Jamoa'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Yuborilgan:</span>
                    <span className="text-sm font-medium">
                      {application.createdAt.toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(application.id, 'approved')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Tasdiqlash
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rad etish
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LeagueApplicationsPage;
