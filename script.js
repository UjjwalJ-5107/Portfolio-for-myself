/*
 * Beginner-friendly portfolio behavior in plain JavaScript.
 * It controls the mobile menu, scroll reveal effect, and Three.js particle background.
 */

const menuButton = document.querySelector("#menu-button");
const mobileNav = document.querySelector("#mobile-nav");

// Open and close the mobile navigation menu.
menuButton.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  menuButton.textContent = isOpen ? "×" : "☰";
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

// Close mobile navigation after any section link is selected.
mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuButton.textContent = "☰";
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  });
});

// Reveal cards and text the first time they become visible during scrolling.
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("active");
  }),
  { threshold: 0.08, rootMargin: "0px 0px -110px" },
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// This section rebuilds the animated Three.js canvas using the same beginner-readable approach as the reference site.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvasHost = document.querySelector("#canvas-container");

if (window.THREE && canvasHost) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasHost.appendChild(renderer.domElement);

  // Create the blue floating particle field.
  const particleCount = reduceMotion ? 160 : 500;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  for (let point = 0; point < particleCount; point += 1) {
    const index = point * 3;
    particlePositions[index] = (Math.random() - 0.5) * 100;
    particlePositions[index + 1] = (Math.random() - 0.5) * 100;
    particlePositions[index + 2] = (Math.random() - 0.5) * 100;
    const shade = Math.random();
    particleColors[index] = 0.12 + shade * 0.22;
    particleColors[index + 1] = 0.38 + shade * 0.3;
    particleColors[index + 2] = 0.72 + shade * 0.27;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
  const particleMaterial = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Create rotating wireframe shapes.
  const shapeOptions = [new THREE.IcosahedronGeometry(3, 0), new THREE.OctahedronGeometry(2.5, 0), new THREE.TetrahedronGeometry(2, 0), new THREE.TorusGeometry(2, 0.5, 8, 16), new THREE.TorusKnotGeometry(1.5, 0.4, 64, 8)];
  const shapeColors = [0x2563eb, 0x0ea5e9, 0x38bdf8, 0x60a5fa, 0x93c5fd];
  const shapes = [];
  const shapeCount = reduceMotion ? 5 : 15;
  for (let count = 0; count < shapeCount; count += 1) {
    const geometry = shapeOptions[Math.floor(Math.random() * shapeOptions.length)];
    const material = new THREE.MeshBasicMaterial({ color: shapeColors[Math.floor(Math.random() * shapeColors.length)], wireframe: true, transparent: true, opacity: 0.31 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 50);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData = {
      originalY: mesh.position.y,
      originalZ: mesh.position.z,
      floatSpeed: Math.random() * 0.5 + 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,
      speedZ: (Math.random() - 0.5) * 0.02,
    };
    shapes.push(mesh);
    scene.add(mesh);
  }

  let targetScroll = window.scrollY;
  let smoothScroll = targetScroll;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("scroll", () => { targetScroll = window.scrollY; }, { passive: true });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  if (!reduceMotion) {
    document.addEventListener("mousemove", (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  function animate() {
    const time = performance.now() * 0.001;
    smoothScroll += (targetScroll - smoothScroll) * 0.1;
    particles.rotation.y = smoothScroll * 0.0005;
    particles.rotation.x = smoothScroll * 0.0003;

    if (!reduceMotion) {
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
      shapes.forEach((shape, index) => {
        shape.rotation.x += shape.userData.speedX;
        shape.rotation.y += shape.userData.speedY;
        shape.rotation.z += shape.userData.speedZ;
        shape.position.y = shape.userData.originalY + Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 3;
        shape.position.z = shape.userData.originalZ + Math.sin(smoothScroll * 0.001 + index) * 1.2;
      });
      const positions = particleGeometry.attributes.position.array;
      for (let index = 0; index < positions.length; index += 3) positions[index + 1] += Math.sin(time + positions[index]) * 0.01;
      particleGeometry.attributes.position.needsUpdate = true;
    }
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
