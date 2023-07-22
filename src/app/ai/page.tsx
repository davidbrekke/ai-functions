'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className='w-screen h-screen flex flex-col items-center p-2 gap-2'>
      <h1 className='px-2.5 py-1 rounded-lg bg-blue-100 text-gray-700 border border-blue-200'>chat</h1>
      <div className='border border-gray-500 p-2 rounded-lg flex flex-col gap-2'>
        {messages && messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col border ${m.role === 'assistant' ? 'items-start border-green-100' : 'items-end border-purple-100'}`}
            >
              <h3 className='text-sm text-gray-600'>{m.role}</h3>
              <p className='text-lg text-gray-800'>{m.content}</p>
            </div>
          ))
        ) : (
          <div>say something to begin!</div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input className='px-2.5 py-1 border border-gray-400 rounded-md text-gray-600' value={input} placeholder='Say something...' onChange={handleInputChange} />
      </form>
    </div>
  );
}
