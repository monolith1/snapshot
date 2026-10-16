import type { SpotInput } from '../types';

const photo = (slug: string, caption: string) => ({
  id: `seed-${slug}`,
  url: `/seed/${slug}.jpg`,
  caption,
});

/**
 * Seed spots. Coordinates are approximate.
 * Seed photos are placeholders — replace them with your own via /admin.
 */
export const SEED_SPOTS: (SpotInput & { id: string })[] = [
  {
    id: 'st-lawrence-market',
    name: 'St. Lawrence Market',
    neighbourhood: 'Old Town',
    description:
      'Early light pours through the tall south windows onto bakers, butchers and fishmongers setting up. Shoot the vendors at work before the crowds arrive, then step outside for Front Street’s flatiron framing.',
    tags: ['people', 'golden hour', 'market', 'interiors'],
    lat: 43.6487,
    lng: -79.3716,
    photos: [photo('st-lawrence-market', 'Morning setup, south hall')],
    bestTime: {
      timeOfDay: '8–10am',
      season: 'Year-round (Saturdays busiest)',
      tip: 'Arrive at 8am on a Saturday — low sun through the windows and vendors mid-setup.',
    },
  },
  {
    id: 'union-station',
    name: 'Union Station',
    neighbourhood: 'Downtown',
    description:
      'The Great Hall’s arched windows and coffered ceiling make for monumental frames. Commuters become silhouettes against the light — use them as scale against the stone.',
    tags: ['architecture', 'silhouettes', 'light beams', 'commuters'],
    lat: 43.6453,
    lng: -79.3806,
    photos: [photo('union-station', 'Great Hall, morning rush')],
    bestTime: {
      timeOfDay: 'Morning, 7:30–9:30am',
      season: 'Winter (sun sits low)',
      tip: 'Expose for the windows and let the morning rush fall into silhouette.',
    },
  },
  {
    id: 'kensington-market',
    name: 'Kensington Market',
    neighbourhood: 'Kensington',
    description:
      'Painted Victorian storefronts, murals, vintage racks and bikes everywhere. It’s colour on colour — look for a single figure against a saturated wall.',
    tags: ['colour', 'murals', 'people', 'storefronts'],
    lat: 43.6545,
    lng: -79.4005,
    photos: [photo('kensington-market', 'Augusta Ave on a weekend afternoon')],
    bestTime: {
      timeOfDay: 'Late afternoon',
      season: 'Summer — Pedestrian Sundays',
      tip: 'Last Sunday of the month in summer: car-free streets and peak street life.',
    },
  },
  {
    id: 'chinatown',
    name: 'Chinatown',
    neighbourhood: 'Spadina Ave',
    description:
      'Spadina comes alive at dusk — neon signage, produce stalls spilling onto the sidewalk and the 510 streetcar rolling through. Rain doubles everything in reflections.',
    tags: ['neon', 'reflections', 'streetcars', 'night'],
    lat: 43.6529,
    lng: -79.3980,
    photos: [photo('chinatown', 'Spadina at blue hour, after rain')],
    bestTime: {
      timeOfDay: 'Dusk / blue hour',
      season: 'Autumn & winter (early sunsets)',
      tip: 'Go right after rain at blue hour — neon on wet pavement does the work.',
    },
  },
  {
    id: 'distillery-district',
    name: 'The Distillery District',
    neighbourhood: 'Distillery',
    description:
      'Pedestrian-only Victorian brick lanes and cobblestones. Late sun rakes across the walls and throws long shadows down Trinity Street — perfect for lone-figure compositions.',
    tags: ['architecture', 'brick', 'shadows', 'cobblestones'],
    lat: 43.6503,
    lng: -79.3596,
    photos: [photo('distillery-district', 'Long shadows, late afternoon')],
    bestTime: {
      timeOfDay: '3–5pm',
      season: 'Autumn',
      tip: 'Mid-afternoon light hits the brick sideways — wait for someone to walk into it.',
    },
  },
  {
    id: 'harbourfront',
    name: 'Harbourfront',
    neighbourhood: 'Waterfront',
    description:
      'Boardwalks, slips and calm water facing the skyline. Silhouettes on the wave decks against sunset, and the whole city mirrored in the lake on still evenings.',
    tags: ['reflections', 'sunset', 'silhouettes', 'skyline'],
    lat: 43.6387,
    lng: -79.3817,
    photos: [photo('harbourfront', 'Boardwalk silhouettes at sunset')],
    bestTime: {
      timeOfDay: 'Sunset',
      season: 'Summer',
      tip: 'Windless evenings give mirror reflections — shoot from the wave decks.',
    },
  },
  {
    id: 'bloor-spadina',
    name: 'Bloor & Spadina',
    neighbourhood: 'The Annex',
    description:
      'Students, cyclists, buskers and shoppers converge at one of the city’s busiest corners. Layered, chaotic, unscripted — stand still and let the scene pile up in front of you.',
    tags: ['people', 'street chaos', 'candid', 'layers'],
    lat: 43.6667,
    lng: -79.4036,
    photos: [photo('bloor-spadina', 'Crossing traffic, overcast afternoon')],
    bestTime: {
      timeOfDay: 'Weekday 4–6pm',
      season: 'September (back-to-school)',
      tip: 'Overcast days give soft, even light — perfect for faces in the crowd.',
    },
  },
  {
    id: 'queen-yonge',
    name: 'Queen & Yonge',
    neighbourhood: 'Downtown Yonge',
    description:
      'Scramble crossings, giant billboards and streetcars on every side. Bring a small tripod or brace on a pole for long exposures that turn crowds into ghosts.',
    tags: ['long exposure', 'crowds', 'billboards', 'night'],
    lat: 43.6525,
    lng: -79.3793,
    photos: [photo('queen-yonge', 'Scramble crossing, 1/4s handheld')],
    bestTime: {
      timeOfDay: 'After dark, 6–9pm',
      season: 'Winter (holiday crowds)',
      tip: 'Shutter around 1/4s on a brace — billboards stay sharp, people blur.',
    },
  },
  {
    id: 'yorkville',
    name: 'Yorkville',
    neighbourhood: 'Yorkville',
    description:
      'Boutique windows, tree-lined side streets and some of the best-dressed pedestrians in the city. Ideal for street style and window-reflection layering.',
    tags: ['street style', 'fashion', 'reflections', 'autumn'],
    lat: 43.6709,
    lng: -79.3930,
    photos: [photo('yorkville', 'Cumberland St in October')],
    bestTime: {
      timeOfDay: 'Afternoon, 1–4pm',
      season: 'Autumn',
      tip: 'October afternoons: autumn leaves, coats out, soft light off the shopfronts.',
    },
  },
  {
    id: 'financial-district',
    name: 'Financial District / CN Tower',
    neighbourhood: 'Financial District',
    description:
      'Glass canyons glowing after hours, with the CN Tower lit at the end of the street. Wet nights turn the whole district into neon reflections.',
    tags: ['neon', 'night', 'architecture', 'reflections'],
    lat: 43.6481,
    lng: -79.3817,
    photos: [photo('financial-district', 'Looking south to the tower on a wet night')],
    bestTime: {
      timeOfDay: 'Night, after 8pm',
      season: 'Late autumn (rainy nights)',
      tip: 'Frame the lit tower down a street canyon and wait for a lone walker.',
    },
  },
];
