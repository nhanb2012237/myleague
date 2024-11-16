import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseconfig';

const fetchUsers = async () => {
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);
  const usersList = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return usersList;
};

const fetchTournamentsByUser = async (userId: string) => {
  const tournamentsCollection = collection(db, `users/${userId}/tournaments`);
  const tournamentsSnapshot = await getDocs(tournamentsCollection);
  const tournamentsList = tournamentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return tournamentsList;
};

const fetchAllTournaments = async () => {
  const users = await fetchUsers();
  const allTournaments = await Promise.all(
    users.map(async (user) => {
      const tournaments = await fetchTournamentsByUser(user.id);
      return { user, tournaments };
    }),
  );
  return allTournaments;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allTournaments = await fetchAllTournaments();
    res.status(200).json(allTournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Error fetching tournaments' });
  }
}
