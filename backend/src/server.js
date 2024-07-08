const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const QRCode = require('qrcode');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;  // Internal port remains 3000
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'qurl';
const baseUrl = process.env.BASE_URL || `http://localhost:3000`;

app.use(bodyParser.json());
app.use(cors());

MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db(dbName);
    const urlsCollection = db.collection('urls');

    // Endpoint to generate QR code
    app.post('/generate', async (req, res) => {
      const { originalUrl, customSlug } = req.body;
      const slug = customSlug || shortid.generate();
      const qrCodeUrl = `${baseUrl}/${slug}`; // Use the BASE_URL for the QR code

      const qrCode = await QRCode.toDataURL(qrCodeUrl);

      const urlData = {
        slug,
        originalUrl,
        qrCode,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      urlsCollection.insertOne(urlData)
        .then(result => {
          res.json(urlData);
        })
        .catch(error => console.error(error));
    });

    // Endpoint to redirect and update views
    app.get('/:slug', (req, res) => {
      const slug = req.params.slug;

      urlsCollection.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' }
      )
        .then(result => {
          if (result.value) {
            res.redirect(result.value.originalUrl);
          } else {
            res.status(404).send('Not Found');
          }
        })
        .catch(error => console.error(error));
    });

    // Endpoint to fetch stats for a specific QR code
    app.get('/stats/:slug', (req, res) => {
      const slug = req.params.slug;

      urlsCollection.findOne({ slug })
        .then(result => {
          if (result) {
            res.json(result);
          } else {
            res.status(404).send('Not Found');
          }
        })
        .catch(error => console.error(error));
    });

    // Endpoint to fetch all stats
    app.get('/stats', (req, res) => {
      urlsCollection.find().toArray()
        .then(results => {
          res.json(results);
        })
        .catch(error => console.error(error));
    });

    // Default endpoint handling
    app.get('/', (req, res) => {
      res.send('Backend is running');
    });

  })
  .catch(error => console.error(error));

app.listen(port, () => {
  console.log(`Server running at ${baseUrl}/`);
});
