require('dotenv/config');
const express = require('express');
const multer = require('multer')
const cors = require('cors');
const AWS = require('aws-sdk');
const { uuid } = require('uuidv4');

const app = express();
const port = 8080

app.use(cors());

const spacesEndpoint = new AWS.Endpoint('ams3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_KEY
});

const storage = multer.memoryStorage({
  destination: function name(req, file, callback) {
    callback(null, '')
  }
})

const upload = multer({storage}).single('image')

app.post('/upload', upload, (req, res) => {
  let myFile = req.file.originalname.split('.');
  const fileType = myFile[myFile.length - 1]
  const params = {
    Body: req.file.buffer,
    Bucket: process.env.REACT_APP_BUCKET,
    Key: `${uuid()}.${fileType}`,
    ACL: 'public-read'
  };
  
  s3.upload(params, (err, data) => {
    if (err) res.status(500).send(err);
    else     res.status(200).send(data);
  });
})

app.listen(port, () => {
  console.log(`Server is runnig at ${port}`)
})
