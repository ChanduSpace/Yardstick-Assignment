const bcrypt = require("bcryptjs");

const createProperHash = async () => {
  try {
    const password = "password";
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("Password:", password);
    console.log("Proper hash:", hashedPassword);
    console.log("Hash length:", hashedPassword.length);

    const testResult = await bcrypt.compare(password, hashedPassword);
    console.log("Test comparison result:", testResult);
  } catch (error) {
    console.error("Error:", error);
  }
};

createProperHash();
