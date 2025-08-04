// src/components/messages/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup, Card, Alert, Spinner } from 'react-bootstrap';
import { sendMessage, getConversationHistory } from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';

function ChatWindow({ socket, otherUserId, currentVendorId, otherUserName, vendorBusinessName }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // --- NEW: Add a check for socket connection status ---
  if (!socket || !socket.connected) {
    console.log('ChatWindow: Socket not connected yet, showing loading state.'); // Debug log
    return (
      <Card className="shadow-sm p-4 text-center d-flex align-items-center justify-content-center" style={{ height: '500px' }}>
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Connecting to chat...</p>
      </Card>
    );
  }
  // --- END NEW CHECK ---

  // Effect to fetch conversation history on component mount/prop change
  useEffect(() => {
    if (!currentUser || !otherUserId || !currentVendorId) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    setError('');
    setMessages([]);

    getConversationHistory(otherUserId, currentVendorId, socket);

    const handleConversationHistory = (history) => {
      console.log('ChatWindow: Received conversation history:', history); // LOG HISTORY
      setMessages(history);
      setLoadingHistory(false);
      scrollToBottom();
    };

    const handleReceiveMessage = (message) => {
      console.log('ChatWindow: Raw message received:', message); // LOG RAW MESSAGE
      const participantIds = [currentUser.uid, otherUserId].sort();
      const expectedConversationId = `${participantIds[0]}_${participantIds[1]}_${currentVendorId}`;

      console.log('ChatWindow: Current User UID:', currentUser.uid); // LOG UID
      console.log('ChatWindow: Other User ID:', otherUserId); // LOG OTHER USER ID
      console.log('ChatWindow: Current Vendor ID:', currentVendorId); // LOG VENDOR ID
      console.log('ChatWindow: Expected Conversation ID:', expectedConversationId); // LOG EXPECTED CONV ID
      console.log('ChatWindow: Received Message Conversation ID:', message.conversationId); // LOG RECEIVED CONV ID

      if (message.conversationId === expectedConversationId) {
        console.log('ChatWindow: Message matches current conversation, adding to state.');
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      } else {
        console.log('ChatWindow: Received message for different conversation, ignoring.');
      }
    };

    socket.on('conversationHistory', handleConversationHistory);
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      console.log('ChatWindow: Cleaning up socket listeners.'); // LOG CLEANUP
      socket.off('conversationHistory', handleConversationHistory);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, currentUser, otherUserId, currentVendorId]); // Dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    // The 'disabled' prop on the input already handles !socket || !socket.connected
    // But this check here ensures the sendMessage function is not called if not ready
    if (socket && socket.connected && currentUser) {
      sendMessage(otherUserId, currentVendorId, newMessageText, socket);
      setNewMessageText('');
    } else {
      setError('Chat service not ready. Please wait or refresh.'); // More user-friendly error
    }
  };

  if (!currentUser) {
    return <Alert variant="warning">Please log in to chat.</Alert>;
  }

  if (loadingHistory) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // console.log('ChatWindow Render: Socket connected status:', socket?.connected); // Remove this log, it's now redundant
  // The input field's disabled prop is correct, but we ensure the component doesn't render until socket is connected.

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Chat with {otherUserName} ({vendorBusinessName})</h5>
      </Card.Header>
      <Card.Body style={{ height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <Alert variant="info" className="text-center my-auto">Start a conversation!</Alert>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`d-flex mb-2 ${msg.senderId === currentUser.uid ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-2 rounded ${msg.senderId === currentUser.uid ? 'bg-info text-white' : 'bg-light border'}`}
                style={{ maxWidth: '70%' }}
              >
                <small className="d-block fw-bold mb-1">
                  {msg.senderId === currentUser.uid ? 'You' : msg.senderName || 'Unknown'}
                </small>
                {msg.text}
                <small className="d-block text-end mt-1" style={{ fontSize: '0.7em' }}>
                  {new Date(msg.timestamp?._seconds * 1000 || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </Card.Body>
      <Card.Footer>
        <Form onSubmit={handleSendMessage}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              disabled={!socket || !socket.connected} // This remains correct
            />
            <Button variant="primary" type="submit" disabled={!socket || !socket.connected || !newMessageText.trim()}>
              Send
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  );
}

export default ChatWindow;