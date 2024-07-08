const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const QRCode = require('qrcode');
const { MongoClient, ObjectId } = require('mongodb');
const logger = require('./logger');  // Import Winston logger module

const app = express();
const port = 3000;  // Internal port remains 3000
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'qurl';
const baseUrl = process.env.BASE_URL || `http://localhost:3000`;

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
      const qrCodeUrl = `${baseUrl}/s/${slug}`; // Updated URL structure

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
        const result = await urlsCollection.findOneAndUpdate(
          { slug },
          { $inc: { views: 1 }, $set: { updatedAt: new Date() } },
          { returnDocument: 'after' }
        );

        if (result.value) {
          logger.info(`Redirecting to: ${result.value.originalUrl}`);
          res.redirect(301, result.value.originalUrl); // Use 301 for permanent redirect if appropriate
        } else {
          logger.warn(`QR code not found for slug: ${slug}`);
          res.status(404).send('Not Found');
        }
      } catch (error) {
        logger.error(`Error fetching and updating QR code: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Endpoint to delete a QR code
    app.delete('/delete/:slug', async (req, res) => {
      const slug = req.params.slug;

      try {
        const result = await urlsCollection.deleteOne({ slug });

        if (result.deletedCount === 1) {
          logger.info(`Deleted QR code with slug: ${slug}`);
          res.status(204).send(); // No content response
        } else {
          logger.warn(`QR code not found for deletion with slug: ${slug}`);
          res.status(404).send('Not Found');
        }
      } catch (error) {
        logger.error(`Error deleting QR code: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Endpoint to edit a QR code's original URL
    app.put('/edit/:slug', async (req, res) => {
      const slug = req.params.slug;
      const { originalUrl } = req.body;

      try {
        const result = await urlsCollection.findOneAndUpdate(
          { slug },
          { $set: { originalUrl, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );

        if (result.value) {
          logger.info(`Updated URL for QR code with slug: ${slug}`);
          res.json(result.value);
        } else {
          logger.warn(`QR code not found for editing with slug: ${slug}`);
          res.status(404).send('Not Found');
        }
      } catch (error) {
        logger.error(`Error updating URL for QR code: ${error.message}`);
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

