const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const QRCode = require('qrcode');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'qurl';
const baseUrl = process.env.FRONTEND_URL || `http://localhost:${port}`; // Use the BASE_URL environment variable

app.use(bodyParser.json());
app.use(cors());

MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db(dbName);
    const urlsCollection = db.collection('urls');

    app.post('/generate', async (req, res) => {
      const { originalUrl, customSlug } = req.body;
      const slug = customSlug || shortid.generate();
      const qrCodeUrl = `${baseUrl}/${slug}`; // Use the BASE_URL environment variable

      const qrCode = await QRCode.toDataURL(qrCodeUrl);

      urlsCollection.insertOne({ slug, originalUrl, qrCode })
        .then(result => {
          res.json({ slug, qrCode });
        })
        .catch(error => console.error(error));
    });

    app.get('/:slug', (req, res) => {
      const slug = req.params.slug;

      urlsCollection.findOne({ slug })
        .then(result => {
          if (result) {
            res.redirect(result.originalUrl);
          } else {
            res.status(404).send('Not Found');
          }
        })
        .catch(error => console.error(error));
    });

  })
  .catch(error => console.error(error));

app.listen(port, () => {
  console.log(`Server running at ${baseUrl}/`);
});
