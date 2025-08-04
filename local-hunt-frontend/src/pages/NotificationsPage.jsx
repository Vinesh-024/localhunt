// src/pages/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import * as notificationApi from '../services/notificationApi';

function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fetchedNotifications = await notificationApi.getNotifications(); // Fetch all notifications
      setNotifications(fetchedNotifications);
    } catch (err) {
      setError(err || 'Failed to fetch notifications.');
      console.error('NotificationsPage: Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      // Update local state or re-fetch
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      alert(`Failed to mark as read: ${err}`);
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationApi.deleteNotification(notificationId);
        // Update local state or re-fetch
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } catch (err) {
        alert(`Failed to delete notification: ${err}`);
        console.error('Error deleting notification:', err);
      }
    }
  };

  if (!currentUser) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="info">Please log in to view your notifications.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading notifications...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="danger">Error: {error}</Alert>
        <Button onClick={fetchNotifications}>Retry</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5">
      <h1 className="text-center mb-4 text-primary">Your Notifications</h1>
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          {notifications.length === 0 ? (
            <Alert variant="info" className="text-center">You have no notifications.</Alert>
          ) : (
            <ListGroup>
              {notifications.map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className="d-flex justify-content-between align-items-start"
                  variant={!notification.read ? 'light' : ''} // Highlight unread
                >
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong className="mb-1">{notification.type === 'new_review' ? 'New Review' : notification.type === 'new_message' ? 'New Message' : 'Notification'}</strong>
                      <small className="text-muted">
                        {notification.timestamp ? new Date(notification.timestamp._seconds * 1000).toLocaleString() : 'N/A'}
                      </small>
                    </div>
                    <p className="mb-1">{notification.message}</p>
                    {!notification.read && (
                      <Badge bg="primary">Unread</Badge>
                    )}
                  </div>
                  <div className="ms-3 d-flex flex-column">
                    {!notification.read && (
                      <Button variant="outline-success" size="sm" className="mb-1" onClick={() => handleMarkAsRead(notification.id)}>
                        Mark as Read
                      </Button>
                    )}
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default NotificationsPage;