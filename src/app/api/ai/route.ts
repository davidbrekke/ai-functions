import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const openai_base_url = 'https://api.openai.com/v1/chat/completions';
const REPLICATE_KEY = process.env.REPLICATE_TOKEN || '';

const audioModel = 'facebookresearch/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906';
const imageModel = 'ai-forever/kandinsky-2:601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f';

const replicate = new Replicate({
  auth: REPLICATE_KEY,
});

const openaiHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${OPENAI_KEY}`,
};

const openaiData = {
  model: 'gpt-4',
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const { query } = await req.json();
    console.log(`query: ${query}`);

    const requestData = {
      ...openaiData,
      messages: [{ role: 'user', content: query }],
      functions: [
        {
          name: 'createAudio',
          description: 'call this function if the request asks to generate music or audio',
          parameters: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'the exact prompt that was passed in',
              },
              duration: {
                type: 'number',
                description: 'if the user defines a length for the music or audio, return the number only (in seconds)',
              }
            },
          },
        },
        {
          name: 'createImage',
          description: 'call this function if the request asks to generate an image',
          parameters: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'the exact prompt that was passed in',
              },
            },
          },
        },
      ],
    };

    const response = await fetch(openai_base_url, {
        method: 'POST',
        headers: openaiHeaders,
        body: JSON.stringify(requestData)
    });

    const { error, choices } = await response.json();
    if (error) {
        console.error(`🚨 Error: ${JSON.stringify(error, null, 2)}`);
        return NextResponse.json({ error });
    }
    console.log(`choices: ${JSON.stringify(choices, null, 2)}`);
    let choice = choices[0];

    const { function_call } = choice.message;
    console.log(`function_call: ${function_call}`);

    if (function_call) {
        const args = JSON.parse(function_call.arguments);

        switch (function_call.name) {
            case 'createAudio':
                await createAudio(args);
                break;
            case 'createImage':
                await createImage(args);
                break;
            default:
                return NextResponse.json({
                    data: choice.message.content,
                    type: 'text'
                });
                break;
        }

    } else {
        return NextResponse.json({ 
            data: choice.message.content,
            type: 'text'
         });
    }


  } catch (error) {
    console.error(`🚨 Error: ${error}`);
    return NextResponse.json({ error });
  }
};

const createAudio = async (args: any) => {
  console.log(`🎧 creating music`);
  console.log(`args: ${JSON.stringify(args, null, 2)}`);
    const output = await replicate.run(
        audioModel,
        {
            input: {
                model_version: 'melody',
                ...args
            }
        }
    );
    return NextResponse.json({
        data: output,
        type: 'audio'
    });
}

const createImage = async (args: any) => {
  console.log(`📸 creating image`);
  console.log(`args: ${JSON.stringify(args, null, 2)}`);
    const output = await replicate.run(
        imageModel,
        {
            input: {
                ...args
            }
        }
    );
    return NextResponse.json({
        data: output,
        type: 'image'
    });
}