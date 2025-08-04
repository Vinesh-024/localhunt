// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // <--- ADD THIS IMPORT
import {
  signupWithEmailAndPassword,
  loginWithEmailAndPassword,
  registerUserProfileInBackend,
} from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function AuthPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate(); // <--- USE useNavigate hook

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false); // <--- NEW STATE for login success

  // Effect to handle redirection after successful login/signup
  useEffect(() => {
    if (loginSuccess) {
      // Display toast for 5 seconds
      addToast('success', 'Login successful! Redirecting to dashboard...', 5000); // 5 seconds duration
      const timer = setTimeout(() => {
        navigate('/dashboard'); // Redirect after the message
      }, 5000); // Redirect after 5 seconds
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [loginSuccess, navigate, addToast]); // Dependencies for useEffect

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginSuccess(false); // Reset success state

    try {
      if (isLogin) {
        await loginWithEmailAndPassword(email, password);
        setLoginSuccess(true); // Set success state, useEffect will handle toast and redirect
      } else { // signup
        const user = await signupWithEmailAndPassword(email, password);
        await registerUserProfileInBackend(user.uid, email, name || 'New User', 'user');
        setLoginSuccess(true); // Set success state
      }
    } catch (err) {
      addToast('danger', err);
      console.error("Authentication Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in (e.g., direct access to /auth after being logged in)
  // This will redirect immediately without showing the form.
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);


  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Row>
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h2 className="text-center mb-4 text-primary">
                {isLogin ? 'Login to Local Hunt' : 'Sign Up for Local Hunt'}
              </h2>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                {!isLogin && (
                  <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Your Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-secondary">
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AuthPage;