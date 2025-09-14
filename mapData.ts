import { TouristLocation, MarkerType, ActivityType } from './types';

export const TOURIST_LOCATIONS: TouristLocation[] = [
  {
    id: 'rishikesh-riverside',
    name: 'Rishikesh Riverside',
    description: 'Serene camping spots along the Ganges river, perfect for rafting enthusiasts and spiritual seekers.',
    mapImageUrl: 'https://images.unsplash.com/photo-1604933134109-37887b6d1a93?q=80&w=1974&auto=format&fit=crop',
    activityType: ActivityType.LAKESIDE,
    markers: [
      { id: 'rs1', type: MarkerType.TENT, title: 'Main Beach Camp', description: 'Spacious area for multiple tents with easy river access.', coordinates: { top: '55%', left: '40%' } },
      { id: 'rs2', type: MarkerType.TENT, title: 'Secluded Grove Spot', description: 'A quiet, shaded spot for 1-2 tents, nestled among trees.', coordinates: { top: '30%', left: '75%' } },
      { id: 'rs3', type: MarkerType.COOKING, title: 'Community Fire Pit', description: 'Designated zone for cooking and bonfires. Firewood available nearby.', coordinates: { top: '60%', left: '55%' } },
      { id: 'rs4', type: MarkerType.TENT, title: 'Upper Cliff Camp', description: 'Offers a stunning panoramic view of the river valley.', coordinates: { top: '15%', left: '20%' } },
    ],
  },
  {
    id: 'manali-mountain-pass',
    name: 'Manali Mountain Pass',
    description: 'High-altitude adventure with breathtaking views of the Himalayan peaks. For experienced trekkers.',
    mapImageUrl: 'https://images.unsplash.com/photo-1616179262503-27885b73a2a1?q=80&w=2070&auto=format&fit=crop',
    activityType: ActivityType.TREKKING,
    markers: [
      { id: 'mn1', type: MarkerType.TENT, title: 'Base Camp Meadow', description: 'A large, flat meadow ideal for setting up a base camp.', coordinates: { top: '70%', left: '50%' } },
      { id: 'mn2', type: MarkerType.COOKING, title: 'Sheltered Cooking Rock', description: 'A natural rock formation providing shelter from the wind.', coordinates: { top: '65%', left: '60%' } },
      { id: 'mn3', type: MarkerType.TENT, title: 'Glacier View Point', description: 'Camp here for an unforgettable sunrise over the glacier.', coordinates: { top: '25%', left: '30%' } },
    ],
  },
  {
    id: 'goa-beach-camp',
    name: 'Goa Beach Camp',
    description: 'Relax to the sound of waves. Beachside camping with easy access to shacks and water sports.',
    mapImageUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?q=80&w=1949&auto=format&fit=crop',
    activityType: ActivityType.BEACH,
    markers: [
      { id: 'go1', type: MarkerType.TENT, title: 'Palm Tree Cove', description: 'Set up your tent under the shade of coconut palm trees.', coordinates: { top: '40%', left: '25%' } },
      { id: 'go2', type: MarkerType.COOKING, title: 'Designated BBQ Pit', description: 'A safe, designated area for beach barbecues. Please clean up after.', coordinates: { top: '50%', left: '35%' } },
      { id: 'go3', type: MarkerType.TENT, title: 'Dune Camping Spot', description: 'A more private spot atop a small sand dune, offering great views.', coordinates: { top: '65%', left: '80%' } },
    ],
  },
   {
    id: 'jaisalmer-desert-dunes',
    name: 'Jaisalmer Desert Dunes',
    description: 'Experience the magic of the Thar Desert with a night under a billion stars.',
    mapImageUrl: 'https://images.unsplash.com/photo-1619326938324-eaa75338a2f7?q=80&w=2070&auto=format&fit=crop',
    activityType: ActivityType.CAMPING,
    markers: [
      { id: 'jd1', type: MarkerType.TENT, title: 'Sunset View Dune', description: 'The prime spot for watching the spectacular desert sunset.', coordinates: { top: '50%', left: '50%' } },
      { id: 'jd2', type: MarkerType.COOKING, title: 'Cultural Campfire Zone', description: 'The central point for evening meals and cultural performances.', coordinates: { top: '60%', left: '60%' } },
    ],
  },
];