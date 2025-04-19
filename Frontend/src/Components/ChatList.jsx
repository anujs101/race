// ChatList.js
import React from 'react';

const ChatList = ({ messages }) => {
  return (
    <div className="max-h-full overflow-y-auto">
      {messages.map((message, index) => (
        <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-4 py-2 rounded-lg ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;