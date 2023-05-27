var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mongoose = require('mongoose');

mongoose.connect('mongodb://mongodb/weather').then(() => {
console.log("Connected to MongoDB"); }).catch(err => {
console.log("MongoDB connection error: "+err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection lost. Exiting...');
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

var Schema = mongoose.Schema;

var weatherSchema = new Schema({
  date: String,
  meanT: Number,
  maxT: Number,
  minT: Number,
  humidity: Number,
  rain: Number
});

var weatherRecord = mongoose.model("wrecord", weatherSchema);

app.post('/weather/:year/:month/:day', (req, res, next) => {
  
  const year = req.params.year;
  const month = req.params.month;
  const day = req.params.day;

  // Check if the date is valid
  const isValidDate = (new Date(`${year}-${month}-${day}`)).toString() !== 'Invalid Date';
  if (!isValidDate) {
    res.status(400).json({ 'error': 'not a valid year/month/date' });
    return;
  }

  // Check if a record already exists for the given date
  weatherRecord.findOne({ date: `${year}-${month}-${day}` }, (err, record) => {
    if (err) {
      res.status(500).json({ 'error': err.message });
      return;
    }

    if (record) {
      res.status(403).json({ 'error': 'find an existing record. Cannot override!!' });
      return;
    }

    // If no record exists, create a new one
    const data = req.body;
    const newRecord = new weatherRecord({
      date: `${year}-${month}-${day}`,
      meanT: data.meanT,
      maxT: data.maxT,
      minT: data.minT,
      humidity: data.humidity,
      rain: data.rain
    });

    newRecord.save((err) => {
      if (err) {
        res.status(500).json({ 'error': err.message });
        return;
      }

      res.status(200).json({ 'okay': 'record added' });
    });
  });
});



app.get('/weather/temp/:year/:month', (req, res, next) => {
  const year = req.params.year;
  const month = req.params.month;


  // Check if the year and month are valid
  const isValidDate = (new Date(`${year}-${month}-01`)).toString() !== 'Invalid Date';
  if (!isValidDate || year < 1000) {
    res.status(400).json({ 'error': 'not a valid year/month' });
    return;
  }

  // Find all records for the given month
  weatherRecord.find({
    date: {
      $gte: `${year}${month}01`,
      $lte: `${year}${month}${new Date(year, month, 0).getDate()}`
    }
  }, (err, records) => {
    if (err) {
      res.status(500).json({ 'error': err.message });
      return;
    }

    if (records.length === 0) {
      res.status(404).json({ 'error': 'not found' });
      return;
    }

    // Calculate the temperature summary data for the month
    const avgTemp = records.reduce((sum, record) => sum + record.meanT, 0) / records.length;
    const maxTemp = Math.max(...records.map(record => record.maxT));
    const minTemp = Math.min(...records.map(record => record.minT));

    res.status(200).json({
      'Year': Number(year),
      'Month': Number(month),
      'Avg Temp': avgTemp.toFixed(1),
      'Max Temp': maxTemp,
      'Min Temp': minTemp
    });
  });
});

app.get('/weather/humi/:year/:month', (req, res, next) => {
  const year = req.params.year;
  const month = req.params.month;

  // Check if the year and month are valid
  const isValidDate = (new Date(`${year}-${month}-01`)).toString() !== 'Invalid Date';
  if (!isValidDate || year < 1000) {
    res.status(400).json({ 'error': 'not a valid year/month' });
    return;
  }

  // Find all records for the given month
  weatherRecord.find({
    date: {
      $gte: `${year}${month}01`,
      $lte: `${year}${month}${new Date(year, month, 0).getDate()}`
    }
  }, (err, records) => {
    if (err) {
      res.status(500).json({ 'error': err.message });
      return;
    }

    if (records.length === 0) {
      res.status(404).json({ 'error': 'not found' });
      return;
    }

    // Calculate the humidity summary data for the month
    const avgHumi = records.reduce((sum, record) => sum + record.humidity, 0) / records.length;
    const maxHumi = Math.max(...records.map(record => record.humidity));
    const minHumi = Math.min(...records.map(record => record.humidity));

    res.status(200).json({
      'Year': Number(year),
      'Month': Number(month),
      'Avg Humidity': avgHumi.toFixed(2),
      'Max Humidity': maxHumi,
      'Min Humidity': minHumi
    });
  });
});

app.get('/weather/rain/:year/:month', (req, res, next) => {
  const year = req.params.year;
  const month = req.params.month;

  // Check if the year and month are valid
  const isValidDate = (new Date(`${year}-${month}-01`)).toString() !== 'Invalid Date';
  if (!isValidDate || year < 1000) {
    res.status(400).json({ 'error': 'not a valid year/month' });
    return;
  }

  // Find all records for the given month
  weatherRecord.find({
    date: {
      $gte: `${year}${month}01`,
      $lte: `${year}${month}${new Date(year, month, 0).getDate()}`
    }
  }, (err, records) => {
    if (err) {
      res.status(500).json({ 'error': err.message });
      return;
    }

    if (records.length === 0) {
      res.status(404).json({ 'error': 'not found' });
      return;
    }

    // Calculate the rainfall summary data for the month
    const avgRain = records.reduce((sum, record) => sum + record.rain, 0) / records.length;
    const maxDailyRain = Math.max(...records.map(record => record.rain));

    res.status(200).json({
      'Year': Number(year),
      'Month': Number(month),
      'Avg Rainfall': avgRain,
      'Max Daily Rainfall': maxDailyRain
    });
  });
});

app.get('/weather/:year/:month/:day', (req, res, next) => {
  const year = req.params.year;
  const month = req.params.month;
  const day = req.params.day;

  // Check if the date is valid
  const isValidDate = (new Date(`${year}-${month}-${day}`)).toString() !== 'Invalid Date';
  if (!isValidDate || year < 1000) {
    res.status(400).json({ 'error': 'not a valid year/month/date' });
    return;
  }

  // Find the record for the given date
  weatherRecord.findOne({ date: `${year}${month}${day}` }, (err, record) => {
    if (err) {
      res.status(500).json({ 'error': err.message });
      return;
    }

    if (!record) {
      res.status(404).json({ 'error': 'not found' });
      return;
    }
    
    const year = parseInt(record.date.slice(0, 4));
    const month = parseInt(record.date.slice(4, 6));
    const day = parseInt(record.date.slice(6, 8));

    const transformedData = {
      'Year': year,
      'Month': month,
      'Date': day,
      'Avg Temp': record.meanT,
      'Max Temp': record.maxT,
      'Min Temp': record.minT,
      'Humidity': record.humidity,
      'Rainfall': record.rain
    };

    //const transformedJSON = JSON.stringify(transformedData);
    res.status(200).json(transformedData);

  });
});



app.use((req, res, next) => {
  res.status(400).json({ 'error': `Cannot ${req.method} ${req.originalUrl}` });
});


// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'error': err.message});
});

app.listen(8000, () => {
  console.log('Weather app listening on port 8000!')
});