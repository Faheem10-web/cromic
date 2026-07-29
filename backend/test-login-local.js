import axios from "axios";

async function test() {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@gmail.com",
      password: "Admin@123",
    });
    console.log("Login Test Success! Token: " + res.data.token);
  } catch (error) {
    console.error("Login Test Failed:", error.response ? error.response.data : error.message);
  }
}

test();
