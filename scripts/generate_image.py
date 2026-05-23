from diffusers import StableDiffusionPipeline
import torch
from PIL import Image
import os
import uuid

prompt = os.environ.get('PROMPT', 'cyberpunk cat')

pipe = StableDiffusionPipeline.from_pretrained(
    'runwayml/stable-diffusion-v1-5',
    torch_dtype=torch.float32,
    safety_checker=None
)

pipe = pipe.to('cpu')

image = pipe(
    prompt,
    num_inference_steps=20,
    guidance_scale=7.5,
    width=512,
    height=512
).images[0]

os.makedirs('image', exist_ok=True)

filename = f'{uuid.uuid4().hex}.png'
path = os.path.join('image', filename)

image.save(path)

print('saved:', path)
