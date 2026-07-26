require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Facility = require('./models/Facility'); // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://syedsanafarhat_db_user:bYMvpszYHPc16lBw@cluster0.r7ssynu.mongodb.net/protohub';

async function seedFromExcel() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Reading Excel file (this might take a moment due to file size)...');
    // Read the whole file. It might take a few seconds.
    const workbook = xlsx.readFile('../Prototype Lab Equipment Details.xlsx');
    
    let facilitiesToInsert = [];

    workbook.SheetNames.forEach(sheetName => {
      console.log(`Parsing sheet: ${sheetName}`);
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      
      let foundHeaders = false;
      let imageUrlKey = null;
      
      for (const row of data) {
        // Look for the header row
        if (!foundHeaders) {
          const firstCol = row['__EMPTY'] || row['S.No'] || row['Sr. No.'];
          if (typeof firstCol === 'string' && (firstCol.includes('S.No') || firstCol.includes('Sr. No'))) {
            foundHeaders = true;
            // Dynamically find the key that corresponds to the "image url" column
            for (const key of Object.keys(row)) {
              if (String(row[key]).toLowerCase().includes('image url')) {
                imageUrlKey = key;
              }
            }
          }
          continue;
        }

        // We found headers, now process rows
        const labName = row['__EMPTY_1'];
        const equipmentName = row['__EMPTY_2'];
        const specs = row['__EMPTY_5'];
        
        // Use dynamically found key, or fallback to 'image url' if the header was correctly parsed on row 1
        const rawImageUrl = imageUrlKey ? row[imageUrlKey] : row['image url'];
        let image = rawImageUrl ? String(rawImageUrl).trim() : null;
        if (image && (image.toLowerCase() === "no image available" || image.toLowerCase() === "null" || image === "N/A" || image === "-")) {
            image = null;
        }

        // AP Institutions list
        const apInstitutions = [
          { name: 'Andhra University Center for Innovation', city: 'Visakhapatnam' },
          { name: 'AP MedTech Zone (AMTZ)', city: 'Visakhapatnam' },
          { name: 'IIT Tirupati Research Park', city: 'Tirupati' },
          { name: 'Sri Venkateswara University Labs', city: 'Tirupati' },
          { name: 'NIT Andhra Pradesh Prototyping Center', city: 'Tadepalligudem' },
          { name: 'KL University Advanced Labs', city: 'Vijayawada' },
          { name: 'SRM University AP FabLab', city: 'Amaravati' },
          { name: 'JNTU Kakinada Engineering Hub', city: 'Kakinada' },
          { name: 'Guntur Industrial Testing Center', city: 'Guntur' },
          { name: 'Anantapur Incubation Hub', city: 'Anantapur' },
          { name: 'Aditya University', city: 'Surampalem' }
        ];

        if (equipmentName && equipmentName.trim() !== 'NA' && equipmentName.trim() !== '-') {
          // Assign random institution
          const randomInst = apInstitutions[Math.floor(Math.random() * apInstitutions.length)];

          // It's a valid equipment
          facilitiesToInsert.push({
            name: equipmentName.replace(/\r\n/g, ' ').trim(),
            description: specs ? String(specs).replace(/\r\n/g, ' ').trim() : 'Lab equipment',
            location: randomInst.city,
            institution: randomInst.name,
            equipmentType: labName && labName.trim() !== 'NA' ? labName.trim() : 'General Equipment',
            hourlyRate: 1500, // Default rate
            status: 'available',
            rating: 4.5 + (Math.random() * 0.5), // Mock rating between 4.5 and 5.0
            reviews: Math.floor(Math.random() * 100) + 10,
            icon: 'Settings', // Default icon
            imageUrl: image || ''
          });
        }
      }
    });

    console.log(`Found ${facilitiesToInsert.length} facilities to insert.`);
    
    if (facilitiesToInsert.length > 0) {
      console.log('Clearing old facilities...');
      await Facility.deleteMany({});
      
      console.log('Inserting new facilities from Excel...');
      await Facility.insertMany(facilitiesToInsert);
      console.log('Successfully seeded database from Excel!');
    } else {
      console.log('No valid facilities found in the Excel file.');
    }

  } catch (err) {
    console.error('Error seeding from Excel:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedFromExcel();
