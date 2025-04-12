const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', async (req, res) => {
  try {
    const userName = req.body.username;

    if (!userName) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const newUser = new User({ username: userName });
    const savedUser = await newUser.save();

    res.json({
      username: savedUser.username,
      _id: savedUser._id,
    });

  } catch (e) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.get('/api/users', async (req,res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users); 
  } catch (e) {
    res.status(500).json({error: "Error fetch"});
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(500).json({ error: 'User not found' });
    }
    
    const { description, duration, date } = req.body;
    const newExercise = new Exercise({
      userId: user._id,
      description: description,
      duration: duration,
      date: date ? new Date(date) : new Date()
    });
    
    const savedExercise = await newExercise.save();
    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date,
      _id: savedExercise.userId
    });
  } catch (e) {
    res.status(500).json({ error: 'Error creating exercise' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
