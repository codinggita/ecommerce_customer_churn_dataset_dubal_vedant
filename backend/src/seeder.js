const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Customer = require('./models/customer.model');

const STRING_FIELDS = ['Gender', 'Country', 'City', 'Signup_Quarter'];

function cleanDoc(doc) {
  const converted = {};
  for (const key of Object.keys(doc)) {
    if (doc[key] === '' || doc[key] == null) {
      converted[key] = null;
    } else if (STRING_FIELDS.includes(key)) {
      converted[key] = doc[key];
    } else {
      const num = Number(doc[key]);
      converted[key] = isNaN(num) ? null : num;
    }
  }
  return converted;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const jsonPath = path.join(__dirname, '..', '..', 'ecommerce_customer_churn_dataset.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    console.log(`Loaded ${data.length} records from dataset`);

    const cleaned = data.map(cleanDoc);

    await Customer.deleteMany({});
    const inserted = await Customer.insertMany(cleaned, { ordered: false });
    console.log(`Seeded ${inserted.length} customers successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
