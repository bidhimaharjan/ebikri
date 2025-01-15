import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../src/index';
import { usersTable } from '../../../src/db/schema/users';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = req.body;

      // Validate the incoming data
      if (
        !user.businessName ||
        !user.businessType ||
        !user.email ||
        !user.phoneNumber ||
        !user.panNumber ||
        !user.password
      ) {
        return res.status(400).json({ error: 'All fields are required!' });
      }

      // Insert user into the database
      await db.insert(usersTable).values({
        businessName: user.businessName,
        businessType: user.businessType,
        email: user.email,
        phoneNumber: user.phoneNumber,
        panNumber: user.panNumber,
        password: user.password, // Hash the password before storing in production!
      });

      res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
