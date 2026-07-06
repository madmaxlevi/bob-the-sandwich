const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.static('public'));
app.use(express.json());

// Read the saved count from our "database" (a simple file for now)
function getCount() {
  if (!fs.existsSync(DATA_FILE)) {
    return 0;
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return data.count;
}

// Save the count
function saveCount(count) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count }));
}

// API route: get the current count
app.get('/api/count', (req, res) => {
  res.json({ count: getCount() });
});

// API route: increase the count by 1
app.post('/api/increment', (req, res) => {
  const newCount = getCount() + 1;
  saveCount(newCount);
  res.json({ count: newCount });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
