const fs = require('fs');
const path = require('path');

// Load the email list from a JSON file
const loadEmailList = () => {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, '../Data/AuthorizedStudents.json'), 'utf-8'); 
        
        // Parse the raw data as JSON
        const jsonData = JSON.parse(rawData);

        // Access the array within the object
        const emails = jsonData.Sheet1.map(entry => entry.emailId); // Adjusted to use 'Sheet1'
        
        return emails; // Return the extracted email IDs
    } catch (error) {
        console.error('Error loading email list:', error.message);
        return []; // Return an empty array on error
    }
};

module.exports = loadEmailList; // Export the function
