async function test() {
  // 1. login as admin
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@gmail.com", password: "admin" })
  });
  const { token } = await loginRes.json();
  console.log("Token:", token.substring(0, 15) + "...");

  // 2. create a lesson
  const payload = {
    title: "Test Admin Lesson",
    content_type: "video",
    content_url: "https://example.com/video.mp4",
    duration: 120
  };
  const createRes = await fetch("http://localhost:5000/api/courses/7/lessons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });
  const text = await createRes.text();
  console.log("Create Status:", createRes.status);
  console.log("Create Response:", text);
}
test().catch(console.error);
