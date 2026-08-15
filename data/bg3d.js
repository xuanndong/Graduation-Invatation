(function() {
  const canvas = document.getElementById('bg3d');
  if (!canvas) return;

  const scene = new THREE.Scene();
  
  // Use a transparent background in Three.js so CSS radial gradient shows through
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 200;

  // 1. Add Particles (Stars/Dust)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 800; 
  
  const posArray = new Float32Array(particlesCount * 3);
  const colorsArray = new Float32Array(particlesCount * 3);

  const color1 = new THREE.Color('#ffffff'); // Pure White
  const color2 = new THREE.Color('#FCEabb'); // Luminous Gold
  const color3 = new THREE.Color('#FFC107'); // Bright Amber Gold

  for(let i = 0; i < particlesCount * 3; i+=3) {
    posArray[i] = (Math.random() - 0.5) * 800;
    posArray[i+1] = (Math.random() - 0.5) * 800;
    posArray[i+2] = (Math.random() - 0.5) * 800;

    const rand = Math.random();
    let mixedColor = color1;
    if (rand > 0.66) mixedColor = color2;
    else if (rand > 0.33) mixedColor = color3;

    colorsArray[i] = mixedColor.r;
    colorsArray[i+1] = mixedColor.g;
    colorsArray[i+2] = mixedColor.b;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

  function createCircleTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 32;
    texCanvas.height = 32;
    const ctx = texCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return new THREE.CanvasTexture(texCanvas);
  }

  const particleMaterial = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particlesMesh);

  // 2. Add Floating Wireframe Shapes
  const shapes = new THREE.Group();
  scene.add(shapes);

  const geo1 = new THREE.IcosahedronGeometry(20, 0);
  const geo2 = new THREE.OctahedronGeometry(15, 0);
  
  const matWire = new THREE.MeshBasicMaterial({ 
    color: '#F8D800', // Bright Gold for wireframes
    wireframe: true, 
    transparent: true, 
    opacity: 0.25 
  });
  
  for(let i=0; i<30; i++) {
    const useGeo1 = Math.random() > 0.5;
    const mesh = new THREE.Mesh(useGeo1 ? geo1 : geo2, matWire);
    
    mesh.position.set(
      (Math.random() - 0.5) * 600,
      (Math.random() - 0.5) * 600,
      (Math.random() - 0.5) * 600 - 50
    );
    mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    const scale = Math.random() * 0.6 + 0.4;
    mesh.scale.set(scale, scale, scale);
    
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.01,
      ry: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.15
    };
    shapes.add(mesh);
  }

  // 3. Mouse Interaction (Parallax)
  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // 4. Animation Control Variables
  let targetSpeed = 1;
  let currentSpeed = 1;
  let targetZ = 200;

  // EXPOSE API for code.js
  window.bg3dAPI = {
    triggerOpen: () => {
      targetSpeed = 4; // speed up particles
      targetZ = 100;   // camera zooms in
      matWire.opacity = 0.45; // make wireframes brighter
      particleMaterial.size = 3.5;
    },
    triggerClose: () => {
      targetSpeed = 1;
      targetZ = 200;
      matWire.opacity = 0.25;
      particleMaterial.size = 2.5;
    }
  };

  // 5. Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Interpolate speed and camera Z for smooth transitions
    currentSpeed += (targetSpeed - currentSpeed) * 0.02;
    camera.position.z += (targetZ - camera.position.z) * 0.02;

    // Smooth camera movement (parallax)
    camera.position.x += (mouseX * 0.04 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.04 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Rotate particle system
    particlesMesh.rotation.y += 0.001 * currentSpeed;
    particlesMesh.rotation.x += 0.0005 * currentSpeed;

    // Animate shapes
    shapes.children.forEach(child => {
      child.rotation.x += child.userData.rx * currentSpeed;
      child.rotation.y += child.userData.ry * currentSpeed;
      child.position.y += child.userData.vy * currentSpeed;
      if (child.position.y > 350) child.position.y = -350;
      if (child.position.y < -350) child.position.y = 350;
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
