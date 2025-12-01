export const SAMPLE_BOARDS = [
  { _id: 'b1', title: 'Moodboard - Sunrise', owner: { _id: 'u1', username: 'alice' }, labels: ['sun', 'warm'], elements: [{ _id:'e1', type:'image', src:'https://picsum.photos/400/240?random=1' }], likesCount: 4, viewerHasLiked: false },
  { _id: 'b2', title: 'Noir & Blanc', owner: { _id: 'u2', username: 'bob' }, labels: ['bw'], elements: [{ _id:'e2', type:'image', src:'https://picsum.photos/400/240?random=2' }], likesCount: 1, viewerHasLiked: true },
]

export const SAMPLE_USERS = [
  { _id: 'u1', username: 'alice', bio: 'Designer • Lausanne' },
  { _id: 'u2', username: 'bob', bio: 'Photographer' },
]