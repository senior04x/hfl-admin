'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Team {
  id: string;
  name: string;
  logo?: string;
  color?: string;
  description?: string;
}

interface Standing {
  id: string;
  teamId: string;
  team: Team;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const StandingsPage = () => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Standing>>({});

  useEffect(() => {
    const q = query(collection(db, 'standings'), orderBy('points', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const standingsData: Standing[] = [];
      snapshot.forEach((doc) => {
        standingsData.push({
          id: doc.id,
          ...doc.data()
        } as Standing);
      });
      setStandings(standingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (standing: Standing) => {
    setEditingId(standing.id);
    setEditData(standing);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'standings', id), {
        ...editData,
        goalDifference: (editData.goalsFor || 0) - (editData.goalsAgainst || 0),
        updatedAt: new Date(),
      });
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating standing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this standing?')) {
      try {
        await deleteDoc(doc(db, 'standings', id));
      } catch (error) {
        console.error('Error deleting standing:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading standings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Standings Management</h1>
          <p className="text-gray-600 mt-2">Manage team standings and statistics</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((standing, index) => (
                  <tr key={standing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: standing.team.color || '#3B82F6' }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {standing.team.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.matchesPlayed || 0}
                          onChange={(e) => setEditData({...editData, matchesPlayed: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.matchesPlayed
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.wins || 0}
                          onChange={(e) => setEditData({...editData, wins: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.wins
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.draws || 0}
                          onChange={(e) => setEditData({...editData, draws: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.draws
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.losses || 0}
                          onChange={(e) => setEditData({...editData, losses: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.losses
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.goalsFor || 0}
                          onChange={(e) => setEditData({...editData, goalsFor: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.goalsFor
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.goalsAgainst || 0}
                          onChange={(e) => setEditData({...editData, goalsAgainst: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.goalsAgainst
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {standing.goalDifference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === standing.id ? (
                        <input
                          type="number"
                          value={editData.points || 0}
                          onChange={(e) => setEditData({...editData, points: parseInt(e.target.value) || 0})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        standing.points
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === standing.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(standing.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditData({});
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(standing)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(standing.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {standings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No standings available</div>
            <div className="text-gray-400 text-sm mt-2">
              Add some team standings to get started
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandingsPage;


