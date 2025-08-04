// // src/components/messages/ConversationList.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
// import { getConversationsList } from '../../services/socketService';
// import { useAuth } from '../../contexts/AuthContext';

// function ConversationList({ socket, onSelectConversation, activeConversationId }) {
//   const { currentUser, userProfile } = useAuth();
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const fetchConversations = useCallback(async () => {
//     // Only proceed if socket is connected and user/profile are available
//     if (!socket || !socket.connected || !currentUser || !userProfile) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       socket.emit('getConversationsList');

//       const handleConversationsList = (list) => {
//         setConversations(list);
//         setLoading(false);
//       };

//       socket.on('conversationsList', handleConversationsList);

//       return () => {
//         socket.off('conversationsList', handleConversationsList);
//       };
//     } catch (err) {
//       setError(err || 'Failed to load conversations.');
//       console.error('Error fetching conversations:', err);
//       setLoading(false);
//     }
//   }, [socket, currentUser, userProfile]); // Dependencies are correct here

//   useEffect(() => {
//     // Only fetch conversations when socket is connected and ready
//     if (socket && socket.connected) { // <--- IMPORTANT: Add this condition
//       fetchConversations();
//     }
//   }, [fetchConversations, socket]); // Add socket to dependencies

//   useEffect(() => {
//     if (!socket || !socket.connected || !currentUser) return;

//     const handleReceiveMessage = (message) => {
//       setConversations(prevConversations => {
//         const existingIndex = prevConversations.findIndex(
//           conv => conv.conversationId === message.conversationId
//         );

//         if (existingIndex !== -1) {
//           const updatedConversations = [...prevConversations];
//           updatedConversations[existingIndex] = {
//             ...updatedConversations[existingIndex],
//             text: message.text,
//             timestamp: message.timestamp,
//             read: message.senderId === currentUser.uid ? true : false,
//           };
//           const [movedConv] = updatedConversations.splice(existingIndex, 1);
//           return [movedConv, ...updatedConversations];
//         } else {
//           return [{
//             conversationId: message.conversationId,
//             senderId: message.senderId,
//             receiverId: message.receiverId,
//             vendorId: message.vendorId,
//             text: message.text,
//             timestamp: message.timestamp,
//             read: false,
//             partnerName: message.senderId === currentUser.uid ? message.receiverName : message.senderName,
//             vendorName: message.vendorBusinessName,
//           }, ...prevConversations];
//         }
//       });
//     };

//     socket.on('receiveMessage', handleReceiveMessage);
//     return () => {
//       socket.off('receiveMessage', handleReceiveMessage);
//     };
//   }, [socket, currentUser]);


//   if (loading) {
//     return (
//       <div className="text-center my-3">
//         <Spinner animation="border" size="sm" variant="primary" />
//         <p className="ms-2 text-primary">Loading conversations...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return <Alert variant="danger">{error}</Alert>;
//   }

//   if (conversations.length === 0) {
//     return <Alert variant="info" className="text-center">No conversations yet.</Alert>;
//   }

//   return (
//     <ListGroup>
//       {conversations.map((conv) => (
//         <ListGroup.Item
//           key={conv.conversationId}
//           action
//           onClick={() => onSelectConversation(conv)}
//           active={activeConversationId === conv.conversationId}
//           className="d-flex justify-content-between align-items-center"
//         >
//           <div>
//             <strong>{conv.partnerName}</strong>
//             <small className="d-block text-muted">{conv.vendorName}</small>
//             <small className="d-block text-muted text-truncate" style={{ maxWidth: '200px' }}>
//               {conv.text}
//             </small>
//           </div>
//           <small className="text-muted">
//             {new Date(conv.timestamp?._seconds * 1000 || conv.timestamp).toLocaleDateString()}
//           </small>
//           {!conv.read && conv.receiverId === currentUser.uid && (
//             <Badge bg="danger" pill className="ms-2">New</Badge>
//           )}
//         </ListGroup.Item>
//       ))}
//     </ListGroup>
//   );
// }

// export default ConversationList;


// src/components/messages/ConversationList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { getConversationsList } from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext'; // <--- ADD THIS IMPORT

function ConversationList({ socket, onSelectConversation, activeConversationId }) {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast(); // Use useToast
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(''); // Removed local error state

  const fetchConversations = useCallback(async () => {
    if (!socket || !socket.connected || !currentUser || !userProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // setError(''); // Removed local error state
    try {
      socket.emit('getConversationsList');

      const handleConversationsList = (list) => {
        setConversations(list);
        setLoading(false);
      };

      socket.on('conversationsList', handleConversationsList);
      socket.on('messageError', (err) => { // Listen for socket errors from server
          addToast('danger', err || 'Socket error occurred.');
          console.error('Socket error in ConversationList:', err);
      });

      return () => {
        socket.off('conversationsList', handleConversationsList);
        socket.off('messageError'); // Clean up
      };
    } catch (err) {
      addToast('danger', err || 'Failed to load conversations.'); // <--- USE TOAST
      console.error('Error fetching conversations:', err);
      setLoading(false);
    }
  }, [socket, currentUser, userProfile, addToast]); // Added addToast to dependencies

  useEffect(() => {
    if (socket && socket.connected) {
      fetchConversations();
    }
  }, [fetchConversations, socket]);

  // Listener for new messages to update conversation list (e.g., mark as unread, move to top)
  useEffect(() => {
    if (!socket || !socket.connected || !currentUser) return;

    const handleReceiveMessage = (message) => {
      setConversations(prevConversations => {
        const existingIndex = prevConversations.findIndex(
          conv => conv.conversationId === message.conversationId
        );

        if (existingIndex !== -1) {
          const updatedConversations = [...prevConversations];
          updatedConversations[existingIndex] = {
            ...updatedConversations[existingIndex],
            text: message.text,
            timestamp: message.timestamp,
            read: message.senderId === currentUser.uid ? true : false,
          };
          const [movedConv] = updatedConversations.splice(existingIndex, 1);
          return [movedConv, ...updatedConversations];
        } else {
          // If it's a new conversation, add it to the list
          return [{
            conversationId: message.conversationId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            vendorId: message.vendorId,
            text: message.text,
            timestamp: message.timestamp,
            read: false,
            partnerName: message.senderId === currentUser.uid ? message.receiverName : message.senderName,
            vendorName: message.vendorBusinessName,
          }, ...prevConversations];
        }
      });
    };

    socket.on('receiveMessage', handleReceiveMessage);
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, currentUser]);


  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" size="sm" variant="primary" />
        <p className="ms-2 text-primary">Loading conversations...</p>
      </div>
    );
  }

  // Removed local error display: {error && <Alert variant="danger">{error}</Alert>}

  if (conversations.length === 0) {
    return <Alert variant="info" className="text-center">No conversations yet.</Alert>;
  }

  return (
    <ListGroup>
      {conversations.map((conv) => (
        <ListGroup.Item
          key={conv.conversationId}
          action
          onClick={() => onSelectConversation(conv)}
          active={activeConversationId === conv.conversationId}
          className="d-flex justify-content-between align-items-center py-3" /* Added vertical padding */
        >
          <div>
            <strong>{conv.partnerName}</strong>
            <small className="d-block text-muted">{conv.vendorName}</small>
            <small className="d-block text-muted text-truncate" style={{ maxWidth: '200px' }}>
              {conv.text}
            </small>
          </div>
          <small className="text-muted text-nowrap"> {/* Prevent date from wrapping */}
            {new Date(conv.timestamp?._seconds * 1000 || conv.timestamp).toLocaleDateString()}
          </small>
          {!conv.read && conv.receiverId === currentUser.uid && (
            <Badge bg="danger" pill className="ms-2">New</Badge>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default ConversationList;