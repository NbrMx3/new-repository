async function createTestUser() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890'
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Test user created successfully:', data.user);
      console.log('Login credentials: test@example.com / password123');
    } else {
      console.log('Failed to create test user:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestUser();