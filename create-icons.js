import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const srcImage = "C:/Users/hp/.gemini/antigravity/brain/616a5a48-c067-41d8-98d3-352642bfc968/amwali_icon_1788049907962.jpg";

async function main() {
  fs.mkdirSync('./public/icons', { recursive: true });
  
  const image = await Jimp.read(srcImage);
  
  await image.resize({ w: 192, h: 192 }).write('./public/icons/icon-192.png');
  console.log('Created icon-192.png');
  
  const image2 = await Jimp.read(srcImage);
  await image2.resize({ w: 512, h: 512 }).write('./public/icons/icon-512.png');
  console.log('Created icon-512.png');
}

main().catch(console.error);
