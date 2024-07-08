// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const QRCode = require('qrcode');
const { MongoClient } = require('mongodb');
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
      const qrCodeUrl = `${baseUrl}/s/${slug}`; // Include /s in the QR code URL

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
    
          // Perform the redirection
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

    // Endpoint to fetch all stats
    app.get('/stats', async (req, res) => {
      try {
        const stats = await urlsCollection.aggregate([
          {
            $project: {
              slug: 1,
              originalUrl: 1,
              qrCode: 1,
              views: 1,
              createdAt: 1,
              updatedAt: 1,
              weekViews: {
                $cond: {
                  if: { $gte: ['$updatedAt', { $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] }] },
                  then: '$views',
                  else: 0
                }
              }
            }
          }
        ]).toArray();

        logger.info('Retrieved all QR code stats');
        res.json(stats);
      } catch (error) {
        logger.error(`Error fetching all QR code stats: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Endpoint to redirect and update views
    // Update the /s/:slug endpoint to handle redirection after updating views

    // Endpoint to delete a QR code
    app.delete('/s/delete/:slug', (req, res) => {
      const slug = req.params.slug;

      urlsCollection.findOneAndDelete({ slug })
        .then(result => {
          if (result.value) {
            logger.info(`Deleted QR code with slug: ${slug}`);
            res.status(204).send();
          } else {
            logger.warn(`QR code not found for deletion with slug: ${slug}`);
            res.status(404).send('Not Found');
          }
        })
        .catch(error => {
          logger.error(`Error deleting QR code: ${error.message}`);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });

    // Endpoint to edit the original URL of a QR code
    app.put('/s/edit/:slug', async (req, res) => {
      const slug = req.params.slug;
      const { originalUrl } = req.body;

      try {
        const qrCodeUrl = `${baseUrl}/s/${slug}`;
        const qrCode = await QRCode.toDataURL(qrCodeUrl);

        const updatedData = {
          originalUrl,
          qrCode,
          updatedAt: new Date()
        };

        const result = await urlsCollection.findOneAndUpdate(
          { slug },
          { $set: updatedData },
          { returnDocument: 'after' }
        );

        if (result.value) {
          logger.info(`Edited QR code with slug: ${slug}`);
          res.json(result.value);
        } else {
          logger.warn(`QR code not found for edit with slug: ${slug}`);
          res.status(404).send('Not Found');
        }
      } catch (error) {
        logger.error(`Error editing QR code: ${error.message}`);
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
