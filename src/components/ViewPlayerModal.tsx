'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  Users, 
  Target, 
  Hash, 
  Trophy,
  Calendar,
  Shield,
  X
} from 'lucide-react';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  photo?: string;
  teamId: string;
  teamName: string;
  position?: string;
  number?: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

interface ViewPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
}

export function ViewPlayerModal({ isOpen, onClose, player }: ViewPlayerModalProps) {
  if (!player) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Faol';
      case 'inactive': return 'Nofaol';
      case 'suspended': return 'Suspensiya';
      default: return 'Noma\'lum';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O'yinchi Tafsilotlari">
      <div className="space-y-6">
        {/* Player Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {player.firstName} {player.lastName}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(player.status)}>
                    {getStatusText(player.status)}
                  </Badge>
                  <span className="text-sm text-gray-600">{player.teamName}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Shaxsiy Ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-medium">{player.phone}</p>
                </div>
              </div>
              {player.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{player.email}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Jamoa</p>
                  <p className="font-medium">{player.teamName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Pozitsiya</p>
                  <p className="font-medium">{player.position || 'Belgilanmagan'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Raqam</p>
                  <p className="font-medium">{player.number || 'Belgilanmagan'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Ro'yxatdan o'tgan</p>
                  <p className="font-medium">
                    {new Date(player.createdAt).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Statistika
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{player.goals}</div>
                <div className="text-sm text-gray-600">Gollar</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{player.assists}</div>
                <div className="text-sm text-gray-600">Assistlar</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{player.yellowCards}</div>
                <div className="text-sm text-gray-600">Sariq kartochka</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{player.redCards}</div>
                <div className="text-sm text-gray-600">Qizil kartochka</div>
              </div>
            </div>
            
            <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{player.matchesPlayed}</div>
              <div className="text-sm text-gray-600">O'ynagan o'yinlar</div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Yopish
          </Button>
        </div>
      </div>
    </Modal>
  );
}


