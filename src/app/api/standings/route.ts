import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET() {
  try {
    const standingsRef = collection(db, 'standings');
    const q = query(standingsRef, orderBy('points', 'desc'));
    const snapshot = await getDocs(q);
    
    const standings = [];
    snapshot.forEach((doc) => {
      standings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ standings });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const standingsData = {
      teamId: data.teamId,
      team: {
        id: data.team.id,
        name: data.team.name,
        logo: data.team.logo || '',
        color: data.team.color || '#3B82F6',
        description: data.team.description || '',
      },
      matchesPlayed: data.matchesPlayed || 0,
      wins: data.wins || 0,
      draws: data.draws || 0,
      losses: data.losses || 0,
      goalsFor: data.goalsFor || 0,
      goalsAgainst: data.goalsAgainst || 0,
      goalDifference: data.goalDifference || 0,
      points: data.points || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'standings'), standingsData);
    
    return NextResponse.json({ 
      id: docRef.id, 
      message: 'Standings added successfully' 
    });
  } catch (error) {
    console.error('Error adding standings:', error);
    return NextResponse.json({ error: 'Failed to add standings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    await updateDoc(doc(db, 'standings', id), {
      ...updateData,
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ message: 'Standings updated successfully' });
  } catch (error) {
    console.error('Error updating standings:', error);
    return NextResponse.json({ error: 'Failed to update standings' }, { status: 500 });
  }
}


