/**
 * SmartCart Seed Script
 * Run: node seed.js
 * Creates admin user + 40 demo products across all categories
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcart';

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: String, description: String, price: Number, category: String,
  stock: Number, barcode: String, image: String, brand: String,
  unit: String, discount: Number, isActive: Boolean,
  addedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

const sampleProducts = [

  // ─── GROCERIES (10 products) ───
  {
    name: 'Amul Butter 500g',
    description: 'Pure and fresh Amul butter, rich in taste. Perfect for daily use on bread and cooking.',
    price: 260, category: 'Groceries', stock: 50,
    barcode: '8901030007765', brand: 'Amul', unit: 'pack', discount: 0
  },
  {
    name: "Lay's Classic Salted Chips 26g",
    description: 'Crispy potato chips with classic salt flavor. Great snack for any time of the day.',
    price: 20, category: 'Groceries', stock: 200,
    barcode: '8901041015419', brand: 'Lays', unit: 'pack', discount: 0
  },
  {
    name: 'Parle-G Biscuits 800g',
    description: 'The most loved biscuit brand in India. Perfect for dunking in chai or coffee.',
    price: 80, category: 'Groceries', stock: 75,
    barcode: '8901015100252', brand: 'Parle', unit: 'pack', discount: 0
  },
  {
    name: 'Tata Salt 1kg',
    description: 'Vacuum evaporated iodized salt. Pure, clean, and hygienic for everyday cooking.',
    price: 28, category: 'Groceries', stock: 150,
    barcode: '8901272000027', brand: 'Tata', unit: 'kg', discount: 0
  },
  {
    name: 'Fortune Sunflower Oil 1L',
    description: 'Light and healthy sunflower oil with natural Vitamin E. Ideal for daily cooking.',
    price: 160, category: 'Groceries', stock: 80,
    barcode: '8901625100017', brand: 'Fortune', unit: 'litre', discount: 5
  },
  {
    name: 'Aashirvaad Atta 5kg',
    description: 'Whole wheat flour made from the finest quality wheat. Soft rotis every time.',
    price: 280, category: 'Groceries', stock: 60,
    barcode: '8901030780019', brand: 'Aashirvaad', unit: 'kg', discount: 5
  },
  {
    name: 'Maggi 2-Minute Noodles 70g',
    description: 'Delicious masala flavored instant noodles ready in 2 minutes. Classic Indian snack.',
    price: 14, category: 'Groceries', stock: 300,
    barcode: '8901058001352', brand: 'Maggi', unit: 'pack', discount: 0
  },
  {
    name: 'Amul Milk Full Cream 1L',
    description: 'Fresh full cream milk rich in calcium and protein. Pasteurized and homogenized.',
    price: 68, category: 'Groceries', stock: 100,
    barcode: '8901030003927', brand: 'Amul', unit: 'litre', discount: 0
  },
  {
    name: 'Britannia Good Day Cashew Cookies 150g',
    description: 'Buttery cookies loaded with cashew pieces. Perfect tea-time snack.',
    price: 40, category: 'Groceries', stock: 120,
    barcode: '8901063050205', brand: 'Britannia', unit: 'pack', discount: 10
  },
  {
    name: 'Bournvita Health Drink 500g',
    description: 'Chocolate flavored health drink with vitamins and minerals for growing children.',
    price: 310, category: 'Groceries', stock: 55,
    barcode: '8901072000055', brand: 'Bournvita', unit: 'pack', discount: 0
  },

  // ─── ELECTRONICS (8 products) ───
  {
    name: 'boAt Rockerz 450 Bluetooth Headphones',
    description: 'Wireless Bluetooth headphones with 15-hour playback, deep bass, and foldable design.',
    price: 1499, category: 'Electronics', stock: 20,
    barcode: '8906084459994', brand: 'boAt', unit: 'piece', discount: 20
  },
  {
    name: 'Syska 9W LED Bulb',
    description: 'Energy saving LED bulb with 9W power, equivalent to 60W. Lasts up to 25000 hours.',
    price: 89, category: 'Electronics', stock: 200,
    barcode: '8906032900019', brand: 'Syska', unit: 'piece', discount: 10
  },
  {
    name: 'Realme Buds Wireless 2',
    description: 'Neckband style wireless earphones with 17 hours battery life and magnetic charging.',
    price: 999, category: 'Electronics', stock: 35,
    barcode: '6941399030023', brand: 'Realme', unit: 'piece', discount: 15
  },
  {
    name: 'Mi Power Bank 10000mAh',
    description: 'Compact 10000mAh power bank with dual USB output and fast charging support.',
    price: 999, category: 'Electronics', stock: 40,
    barcode: '6934177700002', brand: 'Mi', unit: 'piece', discount: 0
  },
  {
    name: 'Portronics USB Hub 4 Port',
    description: '4-port USB 3.0 hub with LED indicator. Plug and play, no driver required.',
    price: 599, category: 'Electronics', stock: 30,
    barcode: '8904258700019', brand: 'Portronics', unit: 'piece', discount: 0
  },
  {
    name: 'TP-Link TL-WR820N WiFi Router',
    description: '300Mbps wireless N router with 2 external antennas for better WiFi coverage.',
    price: 1199, category: 'Electronics', stock: 15,
    barcode: '6935364020170', brand: 'TP-Link', unit: 'piece', discount: 10
  },
  {
    name: 'Zebronics Zeb-Laptop Cooling Pad',
    description: 'Laptop cooling pad with 2 fans, USB powered, compatible with 15.6 inch laptops.',
    price: 699, category: 'Electronics', stock: 25,
    barcode: '8904062401234', brand: 'Zebronics', unit: 'piece', discount: 5
  },
  {
    name: 'AmazonBasics AA Batteries 8-Pack',
    description: 'Long lasting AA alkaline batteries. Ideal for remotes, toys, and everyday devices.',
    price: 349, category: 'Electronics', stock: 100,
    barcode: '8901555678901', brand: 'AmazonBasics', unit: 'pack', discount: 0
  },

  // ─── HOME & KITCHEN (6 products) ───
  {
    name: 'Surf Excel Easy Wash 1kg',
    description: 'Powerful detergent powder that removes tough stains in the first wash.',
    price: 130, category: 'Home & Kitchen', stock: 40,
    barcode: '8901030677789', brand: 'Surf Excel', unit: 'kg', discount: 5
  },
  {
    name: 'Vim Dishwash Bar 200g',
    description: 'Lemon powered dish wash bar that cuts grease and leaves utensils sparkling clean.',
    price: 30, category: 'Home & Kitchen', stock: 150,
    barcode: '8901030340781', brand: 'Vim', unit: 'piece', discount: 0
  },
  {
    name: 'Prestige Pressure Cooker 3L',
    description: 'Aluminium pressure cooker with safety valve. Ideal for rice, dal, and vegetables.',
    price: 899, category: 'Home & Kitchen', stock: 20,
    barcode: '8901297000034', brand: 'Prestige', unit: 'piece', discount: 10
  },
  {
    name: 'Milton Steel Water Bottle 1L',
    description: 'Stainless steel water bottle that keeps water cold for 24 hours. Leak proof.',
    price: 450, category: 'Home & Kitchen', stock: 60,
    barcode: '8901237000099', brand: 'Milton', unit: 'piece', discount: 0
  },
  {
    name: 'Godrej Ezee Liquid Detergent 1kg',
    description: 'Gentle liquid detergent for woolens and delicate fabrics. No shrinkage.',
    price: 175, category: 'Home & Kitchen', stock: 45,
    barcode: '8901801100014', brand: 'Godrej', unit: 'kg', discount: 5
  },
  {
    name: 'Cello Opalware Dinner Set 18pcs',
    description: '18-piece opalware dinner set including plates, bowls. Microwave safe.',
    price: 1299, category: 'Home & Kitchen', stock: 15,
    barcode: '8901825000187', brand: 'Cello', unit: 'piece', discount: 15
  },

  // ─── BEAUTY & PERSONAL CARE (6 products) ───
  {
    name: 'Dettol Hand Sanitizer 500ml',
    description: 'Kills 99.9% germs without water. Ideal for on-the-go hand hygiene.',
    price: 220, category: 'Beauty', stock: 60,
    barcode: '6287003986539', brand: 'Dettol', unit: 'ml', discount: 15
  },
  {
    name: 'Himalaya Neem Face Wash 150ml',
    description: 'Purifying neem face wash that removes impurities and prevents pimples.',
    price: 95, category: 'Beauty', stock: 85,
    barcode: '8901138512040', brand: 'Himalaya', unit: 'ml', discount: 0
  },
  {
    name: 'Dove Soap Bar 100g',
    description: 'Moisturizing beauty bar with 1/4 moisturizing cream. Leaves skin soft and smooth.',
    price: 55, category: 'Beauty', stock: 120,
    barcode: '8901030745740', brand: 'Dove', unit: 'piece', discount: 0
  },
  {
    name: 'Colgate Strong Teeth Toothpaste 200g',
    description: 'Toothpaste with active fluoride to strengthen teeth and prevent cavities.',
    price: 82, category: 'Beauty', stock: 100,
    barcode: '8901314001217', brand: 'Colgate', unit: 'gram', discount: 5
  },
  {
    name: 'Head & Shoulders Anti-Dandruff Shampoo 340ml',
    description: 'Anti-dandruff shampoo with zinc pyrithione. Removes dandruff in 1 wash.',
    price: 299, category: 'Beauty', stock: 70,
    barcode: '8001841274249', brand: 'Head & Shoulders', unit: 'ml', discount: 10
  },
  {
    name: 'Nivea Soft Moisturizing Cream 100ml',
    description: 'Light moisturizing cream with Vitamin E and Jojoba oil. Non-greasy formula.',
    price: 175, category: 'Beauty', stock: 90,
    barcode: '4005808194308', brand: 'Nivea', unit: 'ml', discount: 0
  },

  // ─── BOOKS (4 products) ───
  {
    name: 'Classmate Notebook 200 Pages',
    description: 'Single-lined premium notebook with soft cover. Ideal for school and college.',
    price: 70, category: 'Books', stock: 120,
    barcode: '8901278320036', brand: 'Classmate', unit: 'piece', discount: 0
  },
  {
    name: 'Camlin Geometry Box',
    description: 'Complete geometry box with compass, divider, set squares, and protractor.',
    price: 95, category: 'Books', stock: 80,
    barcode: '8901006001234', brand: 'Camlin', unit: 'piece', discount: 0
  },
  {
    name: 'Reynolds 045 Ball Pen (Pack of 10)',
    description: 'Smooth writing blue ball pens. Comfortable grip, consistent ink flow.',
    price: 90, category: 'Books', stock: 200,
    barcode: '8901337000104', brand: 'Reynolds', unit: 'pack', discount: 10
  },
  {
    name: 'Faber-Castell Color Pencils 24 Shades',
    description: '24 vibrant color pencils for drawing, sketching, and art projects.',
    price: 165, category: 'Books', stock: 60,
    barcode: '4005401154242', brand: 'Faber-Castell', unit: 'pack', discount: 5
  },

  // ─── SPORTS (3 products) ───
  {
    name: 'Cosco Synthetic Football Size 5',
    description: 'Durable synthetic leather football for outdoor play. Machine stitched panels.',
    price: 599, category: 'Sports', stock: 25,
    barcode: '8901337100123', brand: 'Cosco', unit: 'piece', discount: 10
  },
  {
    name: 'Nivia Skipping Rope',
    description: 'Adjustable length skipping rope with foam handles. Great for cardio workout.',
    price: 199, category: 'Sports', stock: 50,
    barcode: '8901337200456', brand: 'Nivia', unit: 'piece', discount: 0
  },
  {
    name: 'Adidas Water Bottle 750ml',
    description: 'Leak-proof sports water bottle with flip-top lid. BPA free plastic.',
    price: 499, category: 'Sports', stock: 40,
    barcode: '4058025876543', brand: 'Adidas', unit: 'piece', discount: 15
  },

  // ─── CLOTHING (3 products) ───
  {
    name: 'Jockey Men\'s T-Shirt (M)',
    description: 'Comfortable cotton blend round-neck t-shirt. Breathable and soft fabric.',
    price: 499, category: 'Clothing', stock: 30,
    barcode: '8901326100789', brand: 'Jockey', unit: 'piece', discount: 20
  },
  {
    name: 'Hanes Men\'s Socks Pack of 3',
    description: 'Cotton ankle socks with cushioned sole. Machine washable and durable.',
    price: 199, category: 'Clothing', stock: 80,
    barcode: '7204101000234', brand: 'Hanes', unit: 'pack', discount: 0
  },
  {
    name: 'Dollar Bigboss Vest Pack of 2',
    description: 'Pure cotton inner vest with ribbed texture. Comfortable for everyday wear.',
    price: 299, category: 'Clothing', stock: 60,
    barcode: '8901199000567', brand: 'Dollar', unit: 'pack', discount: 5
  },

];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');
  console.log('📦 Database:', MONGO_URI);
  console.log('');

  // ── Create Admin User ──
  const existingAdmin = await User.findOne({ email: 'admin@demo.com' });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 12);
    await User.create({ name: 'Admin User', email: 'admin@demo.com', password: hashed, role: 'admin' });
    console.log('✅ Admin created');
    console.log('   📧 Email   : admin@demo.com');
    console.log('   🔑 Password: admin123');
  } else {
    console.log('ℹ️  Admin already exists: admin@demo.com');
  }

  // ── Create Demo User ──
  const existingUser = await User.findOne({ email: 'user@demo.com' });
  if (!existingUser) {
    const hashed = await bcrypt.hash('user123', 12);
    await User.create({ name: 'Demo User', email: 'user@demo.com', password: hashed, role: 'user' });
    console.log('✅ Demo user created');
    console.log('   📧 Email   : user@demo.com');
    console.log('   🔑 Password: user123');
  } else {
    console.log('ℹ️  Demo user already exists');
  }

  console.log('');

  // ── Add Products ──
  const admin = await User.findOne({ email: 'admin@demo.com' });
  let added = 0;
  let skipped = 0;

  for (const p of sampleProducts) {
    const exists = await Product.findOne({ barcode: p.barcode });
    if (!exists) {
      await Product.create({ ...p, image: '', isActive: true, addedBy: admin._id });
      console.log(`  ✅ Added: ${p.name} [${p.barcode}]`);
      added++;
    } else {
      skipped++;
    }
  }

  console.log('');
  console.log(`📊 Summary:`);
  console.log(`   ✅ ${added} products added`);
  console.log(`   ⏭️  ${skipped} products already existed`);
  console.log(`   📦 Total in DB: ${await Product.countDocuments()}`);
  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('🚀 Now run: node server.js');
  console.log('🌐 Frontend: npm start (in frontend folder)');
  console.log('');
  console.log('📋 ALL PRODUCTS & BARCODES:');
  console.log('─'.repeat(70));

  const allProducts = await Product.find().sort({ category: 1 });
  let currentCategory = '';
  for (const p of allProducts) {
    if (p.category !== currentCategory) {
      currentCategory = p.category;
      console.log(`\n  📁 ${currentCategory}`);
    }
    console.log(`     ${p.name.padEnd(38)} | ${p.barcode || 'No barcode'} | ₹${p.price}`);
  }
  console.log('─'.repeat(70));

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
