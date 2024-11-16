import { NextApiRequest, NextApiResponse } from 'next';
import { JsonDatabase } from 'brackets-json-db';
import { BracketsManager } from 'brackets-manager';
import * as xlsx from 'xlsx';

const storage = new JsonDatabase();
const manager = new BracketsManager(storage);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { file } = req.body;

    if (!file || typeof file !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing file' });
    }

    try {
      // Decode the base64 file
      const workbook = xlsx.read(Buffer.from(file, 'base64'), {
        type: 'buffer',
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Extract team names from the data
      const teams = data
        .slice(1)
        .map((row) => row[0])
        .filter((name) => typeof name === 'string');

      // Add teams to the manager
      // const promises = teams.map((team) => manager.add.tteam({ name: team }));
      // await Promise.all(promises);

      res.status(200).json({ message: 'Teams imported successfully', teams });
    } catch (error) {
      console.error('Failed to import teams:', error);
      res.status(500).json({ error: 'Failed to import teams' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
