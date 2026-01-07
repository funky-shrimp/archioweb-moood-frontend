// Fonction helper pour générer un thumbnail de démonstration
function generateDemoThumbnail(elements, width = 520, height = 280) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  
  // Fond
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, width, height)
  
  // Dessiner quelques éléments de démonstration
  const colors = {
    text: '#a78bfa',
    image: '#60a5fa',
    audio: '#f472b6',
    video: '#34d399'
  }
  
  elements.forEach((el, idx) => {
    const x = 40 + (idx % 3) * 160
    const y = 40 + Math.floor(idx / 3) * 100
    const w = 140
    const h = 90
    
    // Rectangle coloré
    ctx.fillStyle = colors[el.type] || '#9ca3af'
    ctx.fillRect(x, y, w, h)
    
    // Bordure
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)
    
    // Texte
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(el.type.toUpperCase(), x + w / 2, y + h / 2)
  })
  
  return canvas.toDataURL('image/png')
}

export const SAMPLE_BOARDS = [
  { 
    _id: 'b1', 
    title: 'Moodboard - Sunrise', 
    owner: { _id: 'u1', username: 'alice' }, 
    labels: ['sun', 'warm'], 
    elements: [
      { _id:'e1', type:'image', src:'https://picsum.photos/400/240?random=1', x: 40, y: 40, z: 1 },
      { _id:'e2', type:'text', src:'Beautiful sunrise', x: 200, y: 40, z: 2 },
      { _id:'e3', type:'image', src:'https://picsum.photos/400/240?random=3', x: 360, y: 40, z: 3 }
    ], 
    likesCount: 4, 
    viewerHasLiked: false,
    get thumbnail() {
      return generateDemoThumbnail(this.elements)
    }
  },
  { 
    _id: 'b2', 
    title: 'Noir & Blanc', 
    owner: { _id: 'u2', username: 'bob' }, 
    labels: ['bw'], 
    elements: [
      { _id:'e4', type:'image', src:'https://picsum.photos/400/240?random=2', x: 40, y: 40, z: 1 },
      { _id:'e5', type:'video', src:'video.mp4', x: 200, y: 40, z: 2 }
    ], 
    likesCount: 1, 
    viewerHasLiked: true,
    get thumbnail() {
      return generateDemoThumbnail(this.elements)
    }
  },
]

export const SAMPLE_USERS = [
  { _id: 'u1', username: 'alice', bio: 'Designer • Lausanne' },
  { _id: 'u2', username: 'bob', bio: 'Photographer' },
]