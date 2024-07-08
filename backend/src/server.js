// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const QRCode = require('qrcode');
const { MongoClient } = require('mongodb');
const winston = require('winston');  // Import Winston logger module

const app = express();
const port = 3000;  // Internal port remains 3000
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'qurl';
const baseUrl = process.env.BASE_URL || `http://localhost:3000`;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

app.use(bodyParser.json());
app.use(cors());

MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    logger.info('Connected to Database');
    const db = client.db(dbName);
    const urlsCollection = db.collection('urls');

    // Endpoint to generate QR code
    app.post('/generate', async (req, res) => {
      const { originalUrl, customSlug } = req.body;
      const slug = customSlug || shortid.generate();
      const qrCodeUrl = `${baseUrl}/s/${slug}`; // Use the updated BASE_URL for the QR code

      try {
        const qrCode = await QRCode.toDataURL(qrCodeUrl);

        const urlData = {
          slug,
          originalUrl,
          qrCode,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await urlsCollection.insertOne(urlData);
        logger.info(`Generated QR code for slug: ${slug}`);
        res.json(urlData);
      } catch (error) {
        logger.error(`Error generating QR code: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Endpoint to fetch stats for a specific QR code
    app.get('/stats/:slug', async (req, res) => {
      const slug = req.params.slug;

      try {
        const result = await urlsCollection.findOne({ slug });
        if (result) {
          logger.info(`Retrieved stats for QR code slug: ${slug}`);
          res.json(result);
        } else {
          logger.warn(`QR code stats not found for slug: ${slug}`);
          res.status(404).send('Not Found');
        }
      } catch (error) {
        logger.error(`Error fetching QR code stats: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Endpoint to fetch all stats
    app.get('/stats', async (req, res) => {
      try {
        const results = await urlsCollection.find().toArray();
        logger.info('Retrieved all QR code stats');
        res.json(results);
      } catch (error) {
        logger.error(`Error fetching all QR code stats: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Endpoint to redirect and update views
    app.get('/s/:slug', async (req, res) => {
      const slug = req.params.slug;

      try {
        logger.info(`Attempting to find QR code for slug: ${slug}`);

        const result = await urlsCollection.findOneAndUpdate(
          { slug },
          { $inc: { views: 1 }, $set: { updatedAt: new Date() } },
          { returnDocument: 'after' }
        );

        if (result.value) {
          const originalUrl = result.value.originalUrl;
          logger.info(`Found QR code for slug: ${slug}. Redirecting to: ${originalUrl}`);
          res.redirect(301, originalUrl); // Use 301 for permanent redirect if appropriate
        } else {
          logger.warn(`QR code not found for slug: ${slug}`);
          res.status(404).send('Not Found');
        }
      } catch (error) {
        logger.error(`Error fetching and updating QR code for slug ${slug}: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Default endpoint handling
    app.get('/', (req, res) => {
      res.send('Backend is running');
    });

  })
  .catch(error => {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(error);
  });

app.listen(port, () => {
  logger.info(`Server running at ${baseUrl}/`);
});

