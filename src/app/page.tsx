'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [image, setImage] = useState('');
  const [audio, setAudio] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const ai = async () => {
    try {
      if (!input) return;
      setLoading(true);
      setImage('');
      setAudio('');
      setText('');

      const response = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ query: input }),
      });

      const { data, type } = await response.json();
      console.log(`data: ${data}`);
      console.log(`type: ${type}`);

      switch (type) {
        case 'image':
          setImage(data[0]);
          break;
        case 'audio':
          setAudio(data);
          break;
        case 'text':
          setText(data);
          break;
        default:
          setText(`unknown type: ${type}`)
          break;
      }
      setLoading(false);

    } catch (error) {
      console.error(`🚨 error: ${error}`);
    }
  };
  return (
    <main className='flex flex-col items-center justify-between p-24'>
      <input
        className='text-black px-3 py-1 rounded'
        onChange={e => setInput(e.target.value)}
      />
      <button
        className='rounded-lg bg-blue-400 text-white py-3 px-14 mt-3 mb-4 cursor-pointer'
        onClick={ai}
      >imagine</button>
      {image && <img src={image} width='500' />}
      {audio && (
        <audio controls>
          <source src={audio} type='audio/wav' />
        </audio>
        )
      }
      {text && <p className='text-2xl'>{text}</p>}
      {loading && <p className='text-2xl'>loading...</p>}
    </main>
  );
}
