const fs = require('fs');

const generateCSV = (numRows) => {
  const headers = "Name,Email Address,Phone Number,Company,Location,Status,Notes\n";
  let rows = "";
  
  const statuses = [
    "Client is interested",
    "Did not answer",
    "Junk lead",
    "Sale completed",
    "Follow up later",
    "Number was busy",
    "Disqualified prospect"
  ];
  
  for (let i = 1; i <= numRows; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    // Add some realistic messy data
    const email = `user${i}@example.com${i % 3 === 0 ? `; secondary${i}@test.com` : ''}`;
    const phone = i % 2 === 0 ? `+91 9876543${String(i).padStart(3, '0')}` : `123-456-${String(i).padStart(4, '0')}`;
    
    rows += `User ${i},${email},${phone},Company ${i},New York,${status},"Note ${i}"\n`;
  }
  
  fs.writeFileSync('test_150_rows.csv', headers + rows);
  console.log('test_150_rows.csv generated!');
};

generateCSV(150);
