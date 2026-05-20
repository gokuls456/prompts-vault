/**
 * Seeder script — populates the DB with sample prompts & an admin user.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Prompt = require('./models/Prompt');

const SAMPLE_PROMPTS = [
  {
    title: 'Cyberpunk Neon Portrait',
    description:
      'A hyperrealistic portrait of a woman with glowing cyberpunk neon tattoos illuminating her face in the dark, 4K resolution, cinematic lighting, ultra-detailed skin texture, sharp focus, artstation trending, octane render',
    image: 'https://picsum.photos/seed/cyber1/800/1000',
    type: 'photo',
    category: 'Portrait',
    tags: ['cyberpunk', 'portrait', 'neon', 'realistic', 'female'],
    variants: ['4K', 'Cinematic', 'Ultra-realistic', 'Octane Render'],
  },
  {
    title: 'Ancient Alien Temple',
    description:
      'An ancient alien temple hidden deep in a lush tropical jungle at golden hour, volumetric god rays piercing through the canopy, intricate stone carvings, photorealistic, 8K, epic wide angle shot, unreal engine 5',
    image: 'https://picsum.photos/seed/temple2/800/1000',
    type: 'photo',
    category: 'Sci-Fi',
    tags: ['alien', 'temple', 'jungle', 'ancient', 'epic'],
    variants: ['8K', 'Wide Angle', 'Golden Hour', 'UE5'],
  },
  {
    title: 'Futuristic Tokyo Rain',
    description:
      'Futuristic Tokyo cyberpunk cityscape at night during heavy rain, neon reflections on wet streets, flying cars, holographic advertisements, photorealistic, cinematic depth of field, f/1.8, anamorphic lens flares',
    image: 'https://picsum.photos/seed/tokyo3/800/600',
    type: 'photo',
    category: 'Sci-Fi',
    tags: ['cyberpunk', 'city', 'neon', 'rain', 'tokyo', 'night'],
    variants: ['Cinematic', 'Anamorphic', 'Night Shot', 'f/1.8'],
  },
  {
    title: 'Ethereal Forest Fairy',
    description:
      'A magical ethereal forest fairy with translucent wings standing in an enchanted glowing forest, bioluminescent plants, soft diffused light, fantasy art, digital painting, artgerm style, highly detailed',
    image: 'https://picsum.photos/seed/fairy4/800/1000',
    type: 'photo',
    category: 'Fantasy',
    tags: ['fantasy', 'fairy', 'forest', 'magical', 'bioluminescent'],
    variants: ['Digital Painting', 'Fantasy Art', 'Artgerm Style'],
  },
  {
    title: 'Brutalist Space Station',
    description:
      'A massive brutalist space station orbiting a gas giant, cold industrial lighting, worn metal textures, sci-fi concept art, ultra-detailed, space background with nebula, hard surface modeling, 4K, blender render',
    image: 'https://picsum.photos/seed/space5/800/600',
    type: 'photo',
    category: 'Sci-Fi',
    tags: ['space', 'station', 'brutalist', 'scifi', 'industrial'],
    variants: ['4K', 'Concept Art', 'Blender Render', 'Hard Surface'],
  },
  {
    title: 'Abstract Neural Dreams',
    description:
      'Abstract visualization of neural network data streams flowing through a dark void, electric blue and purple energy tendrils, fractal patterns, long exposure photography aesthetic, 8K, ultra-detailed',
    image: 'https://picsum.photos/seed/neural6/800/800',
    type: 'photo',
    category: 'Abstract',
    tags: ['abstract', 'neural', 'energy', 'fractal', 'blue', 'purple'],
    variants: ['8K', 'Long Exposure', 'Fractal', 'Energy Art'],
  },
  {
    title: 'Dragon Rider at Sunset',
    description:
      'A lone armored warrior riding a massive dragon silhouetted against a dramatic fiery sunset over mountain ranges, epic fantasy, Boris Vallejo style, highly detailed, moody atmospheric lighting',
    image: 'https://picsum.photos/seed/dragon7/800/600',
    type: 'photo',
    category: 'Fantasy',
    tags: ['dragon', 'warrior', 'sunset', 'epic', 'fantasy', 'mountains'],
    variants: ['Epic Fantasy', 'Boris Vallejo Style', 'Moody Lighting'],
  },
  {
    title: 'Gothic Cathedral Interior',
    description:
      'Interior of a grand gothic cathedral with towering stained glass windows casting colourful light shafts through ancient dust, photorealistic architectural render, 16mm wide angle, golden hour, hyper-detailed',
    image: 'https://picsum.photos/seed/gothic8/800/1000',
    type: 'photo',
    category: 'Architecture',
    tags: ['gothic', 'cathedral', 'architecture', 'stained glass', 'interior'],
    variants: ['Architectural Render', 'Wide Angle', 'Hyper-detailed'],
  },
  {
    title: 'Samurai in Snowstorm',
    description:
      'A lone samurai standing stoically in a raging blizzard at dusk, bokeh background, katana drawn, traditional Japanese armor with red and black lacquer, cinematic composition, 35mm film grain, colour graded',
    image: 'https://picsum.photos/seed/samurai9/800/1000',
    type: 'photo',
    category: 'Portrait',
    tags: ['samurai', 'japan', 'snow', 'cinematic', 'warrior', 'bokeh'],
    variants: ['35mm Film Grain', 'Cinematic', 'Colour Graded', 'Bokeh'],
  },
  {
    title: 'Underwater Bioluminescent City',
    description:
      'A vast underwater city with bioluminescent coral buildings, schools of glowing jellyfish drifting between towers, deep ocean blue ambiance, concept art, ultra-detailed, volumetric water caustics, James Cameron aesthetic',
    image: 'https://picsum.photos/seed/ocean10/800/600',
    type: 'photo',
    category: 'Fantasy',
    tags: ['underwater', 'city', 'bioluminescent', 'ocean', 'coral', 'fantasy'],
    variants: ['Concept Art', 'Volumetric', 'Ultra-detailed'],
  },
  {
    title: 'Robotic Garden Landscape',
    description:
      'A lush garden tended by elegant white robotic gardeners, cherry blossom trees in full bloom, soft morning light, juxtaposition of nature and technology, impressionist oil painting style, 8K, ultra-detailed',
    image: 'https://picsum.photos/seed/robot11/800/600',
    type: 'photo',
    category: 'Sci-Fi',
    tags: ['robot', 'garden', 'nature', 'technology', 'cherry blossom'],
    variants: ['Oil Painting Style', '8K', 'Impressionist'],
  },
  {
    title: 'Crystal Cave Explorer',
    description:
      'A lone explorer with a headlamp discovering a massive crystal cavern with towering amethyst formations, shafts of light refracting through giant quartz crystals, photorealistic, epic scale, national geographic style',
    image: 'https://picsum.photos/seed/crystal12/800/1000',
    type: 'photo',
    category: 'Nature',
    tags: ['cave', 'crystal', 'explorer', 'nature', 'amethyst', 'underground'],
    variants: ['Photorealistic', 'Epic Scale', 'National Geographic Style'],
  },
  {
    title: 'Time-Lapse Storm Formation',
    description:
      'Cinematic time-lapse video of a massive supercell thunderstorm forming over endless flat plains at dusk, dramatic mammatus clouds, lightning strikes, god rays, 4K video, slow motion, nature documentary style',
    image: 'https://picsum.photos/seed/storm13/800/600',
    type: 'video',
    category: 'Nature',
    tags: ['storm', 'timelapse', 'lightning', 'clouds', 'dramatic', 'video'],
    variants: ['4K Video', 'Slow Motion', 'Documentary Style', 'Time-lapse'],
  },
  {
    title: 'Quantum Portal Animation',
    description:
      'An animated swirling quantum portal opening in a dark void, electric blue and white energy tendrils, particles being drawn in, seamless looping animation, 4K, motion graphics, VFX quality, cinema 4D',
    image: 'https://picsum.photos/seed/portal14/800/800',
    type: 'video',
    category: 'Abstract',
    tags: ['portal', 'animation', 'quantum', 'vfx', 'looping', 'energy'],
    variants: ['4K Animation', 'Seamless Loop', 'VFX Quality', 'Cinema 4D'],
  },
  {
    title: 'Neon Tokyo Street Walk',
    description:
      'A first-person walk through crowded neon-lit Shibuya streets at night, rain-soaked pavements reflecting signs, bustling crowds with umbrellas, cinematic video, anamorphic lens, 24fps film look, blade runner aesthetic',
    image: 'https://picsum.photos/seed/street15/800/600',
    type: 'video',
    category: 'Sci-Fi',
    tags: ['tokyo', 'neon', 'walkthrough', 'rain', 'cinematic', 'blade runner'],
    variants: ['24fps Film Look', 'Anamorphic', 'Cinematic', 'First-Person'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Prompt.deleteMany({});
    console.log('Cleared existing data');

    // Create superadmin (master) user
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@promptvault.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: 'superadmin',
    });
    console.log(`Superadmin created: ${admin.email}`);

    // Create sample user
    await User.create({
      name: 'Demo User',
      email: 'user@promptvault.com',
      password: 'user123456',
      role: 'user',
    });

    // Seed prompts
    const promptsWithCreator = SAMPLE_PROMPTS.map((p) => ({ ...p, createdBy: admin._id }));
    await Prompt.insertMany(promptsWithCreator);
    console.log(`Seeded ${SAMPLE_PROMPTS.length} prompts`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`Admin email: ${admin.email}`);
    console.log(`Admin password: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
