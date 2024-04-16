import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import "../src/Chatbot.css";

const Chatbot = () => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [weburl, setWeburl] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const newSocket = io('http://192.168.29.30:4000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Connected to server');
      });

      socket.on('socket-join-message', userRoom => {
        sessionStorage.setItem('userRoomid', userRoom);
        console.log(userRoom);
      });

      socket.on('client-receive-message', message => {
        setChatMessages(prevMessages => [...prevMessages, { message, type: 'incoming' }]);
      });
    }
  }, [socket]);

  const handleStartChat = () => {
    if (username !== '' && weburl !== '') {
      if (socket) {
        socket.io.uri = 'http://192.168.29.30:4000';
        socket.io.opts.query = {
          participantName: username,
          websiteurl: weburl,
          role: 'Client',
        };
        console.log('Query parameters set:', socket.io.opts.query);
        socket.connect();
      }
    }
  };

  const handleMessageSend = () => {
    if (userMessage.trim() !== '' && socket) {
      socket.emit('client-send-message', userMessage, sessionStorage.getItem('userRoomid'));
      setChatMessages(prevMessages => [...prevMessages, { message: userMessage, type: 'outgoing' }]);
      setUserMessage('');
    }
  };

  const toggleChatbot = () => {
    setShowChatbot(prevState => !prevState);
  };

  return (
    <div className={`chatbot ${showChatbot ? 'show' : ''}`}>
      <button className="chatbot-toggler" onClick={toggleChatbot}>
        <span className={`material-symbols-rounded ${showChatbot ? 'hide' : ''}`}>mode_comment</span>
        <span className={`material-symbols-outlined ${showChatbot ? 'show' : ''}`}>close</span>
      </button>
      <header>
        <h2 id="chatbotTitle">Chatbot</h2>
        <span className="close-btn material-symbols-outlined" onClick={() => setShowChatbot(false)}>close</span>
      </header>
      <div>
        <ul className="chatbox">
          <div className='fixed'>
            <span className="material-symbols-outlined">smart_toy</span>
            <p>Hello</p>
          </div>
          {chatMessages.map((message, index) => (
            <li key={index} className={`chat ${message.type}`}>              
              <p>{message.message}</p>
            </li>
          ))}
        </ul>
        <div className="chat-input">
          <textarea
            placeholder="Enter a message..."
            spellCheck="false"
            required
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
          ></textarea>
          <span id="send-btn" className="material-symbols-rounded" onClick={handleMessageSend}>send</span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
