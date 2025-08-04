// src/pages/MessagesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/messages/ChatWindow';
import ConversationList from '../components/messages/ConversationList';
import * as vendorApi from '../services/vendorApi';

function MessagesPage() {
  const { currentUser, userProfile, loadingAuth } = useAuth();
  const { vendorId: urlVendorId } = useParams();
  const location = useLocation();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingSocket, setLoadingSocket] = useState(true);
  const [socketError, setSocketError] = useState('');
  const [initialVendorDetails, setInitialVendorDetails] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);

  // Effect to connect/disconnect socket
  useEffect(() => {
    // Only connect if currentUser is available and auth is not loading
    if (!currentUser || loadingAuth) {
      // If there's no user or still loading, ensure socket is disconnected
      if (socketInstance) {
        disconnectSocket();
        setSocketInstance(null);
      }
      return;
    }

    const setupSocket = async () => {
      setLoadingSocket(true);
      setSocketError('');
      try {
        const connectedSocket = await connectSocket();
        if (connectedSocket) {
          setSocketInstance(connectedSocket);
          setLoadingSocket(false);
        } else {
          setSocketError('Failed to establish socket connection.');
          setLoadingSocket(false);
        }
      } catch (err) {
        setSocketError(err.message || 'Error connecting to chat service.');
        setLoadingSocket(false);
      }
    };

    // Only call setupSocket if socketInstance is null (i.e., not already connected)
    // This prevents multiple connection attempts if the component re-renders
    if (!socketInstance) { // <--- IMPORTANT: Add this condition
      setupSocket();
    }


    return () => {
      // This cleanup runs on component unmount or if dependencies change
      // Ensure we only disconnect if this effect was responsible for connecting
      if (socketInstance) { // <--- Only disconnect if socketInstance exists
        disconnectSocket();
        setSocketInstance(null);
      }
    };
  }, [currentUser, loadingAuth]); // Dependencies are correct here

  // Effect to handle initial direct chat from VendorDetailPage
  useEffect(() => {
    const initializeDirectChat = async () => {
      if (urlVendorId && !selectedConversation && currentUser && socketInstance && !loadingSocket && !socketError) {
        const vendorFromState = location.state?.vendor;
        let vendorDetails = vendorFromState;

        if (!vendorDetails) {
          try {
            vendorDetails = await vendorApi.getVendorById(urlVendorId);
          } catch (err) {
            console.error('Failed to fetch vendor details for direct chat:', err);
            setSocketError('Failed to load vendor details for chat.');
            return;
          }
        }

        if (vendorDetails) {
          const otherUser = vendorDetails.userId;
          const vendorIdForChat = vendorDetails.id;

          setInitialVendorDetails(vendorDetails);

          setSelectedConversation({
            conversationId: `temp_${currentUser.uid}_${otherUser}_${vendorIdForChat}`,
            senderId: currentUser.uid,
            receiverId: otherUser,
            vendorId: vendorIdForChat,
            text: '',
            timestamp: new Date(),
            partnerName: vendorDetails.businessName,
            vendorName: vendorDetails.businessName,
          });
        }
      }
    };

    if (socketInstance) {
      initializeDirectChat();
    }
  }, [urlVendorId, selectedConversation, currentUser, loadingSocket, socketError, location.state, socketInstance]);


  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setInitialVendorDetails(null);
  };

  if (loadingAuth || loadingSocket || !socketInstance) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">
          {loadingAuth ? 'Loading user session...' : 'Connecting to chat service...'}
        </p>
      </Container>
    );
  }

  if (socketError) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="danger">Chat Service Error: {socketError}</Alert>
        <Button onClick={() => window.location.reload()}>Retry Connection</Button>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="info">Please log in to access messages.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5">
      <h1 className="text-center mb-4 text-primary">Your Messages</h1>
      <Row>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h4 className="text-secondary mb-3">Conversations</h4>
            <ConversationList
              socket={socketInstance}
              onSelectConversation={handleSelectConversation}
              activeConversationId={selectedConversation?.conversationId}
            />
          </Card>
        </Col>
        <Col md={8}>
          {selectedConversation ? (
            <ChatWindow
              socket={socketInstance}
              otherUserId={selectedConversation.senderId === currentUser.uid ? selectedConversation.receiverId : selectedConversation.senderId}
              currentVendorId={selectedConversation.vendorId}
              otherUserName={selectedConversation.partnerName}
              vendorBusinessName={selectedConversation.vendorName}
            />
          ) : (
            <Card className="shadow-sm p-4 text-center d-flex align-items-center justify-content-center" style={{ height: '500px' }}>
              <h4 className="text-muted">Select a conversation to start chatting.</h4>
              {urlVendorId && initialVendorDetails && (
                <Button
                  variant="primary"
                  onClick={() => setSelectedConversation({
                    conversationId: `temp_${currentUser.uid}_${initialVendorDetails.userId}_${initialVendorDetails.id}`,
                    senderId: currentUser.uid,
                    receiverId: initialVendorDetails.userId,
                    vendorId: initialVendorDetails.id,
                    text: '',
                    timestamp: new Date(),
                    partnerName: initialVendorDetails.businessName,
                    vendorName: initialVendorDetails.businessName,
                  })}
                  className="mt-3"
                >
                  Start Chat with {initialVendorDetails.businessName}
                </Button>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default MessagesPage;