import * as THREE from "./vendor/three.module.min.js";

const section = document.querySelector("[data-signal-section]");
const shell = document.querySelector("[data-signal-shell]");
const canvas = document.querySelector("[data-signal-canvas]");
const stageViewport = canvas?.parentElement;
const steps = Array.from(document.querySelectorAll("[data-signal-step]"));
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (section && shell && canvas && stageViewport) {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = (value) => 1 - Math.pow(1 - clamp(value), 3);

  const mapRange = (value, start, end) => {
    if (end <= start) {
      return 0;
    }

    return clamp((value - start) / (end - start));
  };

  const supportsWebGL = () => {
    try {
      const probe = document.createElement("canvas");
      return Boolean(
        window.WebGLRenderingContext &&
          (probe.getContext("webgl") || probe.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  };

  const lowPowerDevice = (() => {
    const memory = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 8;
    const saveData = navigator.connection?.saveData ?? false;
    return saveData || memory <= 2 || cores <= 2;
  })();

  const getScrollProgress = () => {
    const rect = section.getBoundingClientRect();
    const total = Math.max(rect.height - window.innerHeight, 1);
    return clamp(-rect.top / total);
  };

  let targetProgress = getScrollProgress();

  const syncContentState = (progress) => {
    section.style.setProperty("--signal-progress", `${(progress * 100).toFixed(1)}%`);

    if (!steps.length) {
      return;
    }

    const index = Math.min(steps.length - 1, Math.floor(progress * steps.length));

    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
    });
  };

  const bindScrollState = () => {
    const update = () => {
      targetProgress = getScrollProgress();
      syncContentState(targetProgress);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  };

  if (reduceMotionQuery.matches || !supportsWebGL() || lowPowerDevice) {
    bindScrollState();
  } else {
    try {
      bindScrollState();

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !lowPowerDevice,
        alpha: true,
        powerPreference: lowPowerDevice ? "low-power" : "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.2 : 1.6));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0.3, 8.8);

      const ambientLight = new THREE.HemisphereLight(0xe8f4ff, 0x05070a, 1.35);
      const keyLight = new THREE.DirectionalLight(0xbfe7ff, 1.65);
      keyLight.position.set(4.6, 5.2, 6.8);
      const rimLight = new THREE.PointLight(0x78a7ff, 22, 14, 2);
      rimLight.position.set(-4.4, -1.1, 4.2);

      scene.add(ambientLight, keyLight, rimLight);

      const world = new THREE.Group();
      scene.add(world);

      const coreGeometry = new THREE.IcosahedronGeometry(0.92, 1);
      const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0b1220,
        emissive: 0x78a7ff,
        emissiveIntensity: 0.45,
        roughness: 0.22,
        metalness: 0.68,
        clearcoat: 0.95,
        clearcoatRoughness: 0.14,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      world.add(core);

      const glowGeometry = new THREE.SphereGeometry(1.18, 32, 24);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x78a7ff,
        transparent: true,
        opacity: 0.14,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      world.add(glow);

      const shellGeometry = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.7, 1));
      const shellMaterial = new THREE.LineBasicMaterial({
        color: 0xbfe7ff,
        transparent: true,
        opacity: 0.34,
      });
      const shellMesh = new THREE.LineSegments(shellGeometry, shellMaterial);
      world.add(shellMesh);

      const rings = new THREE.Group();
      world.add(rings);

      const ringMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x78a7ff, transparent: true, opacity: 0.32 }),
        new THREE.MeshBasicMaterial({ color: 0xbfe7ff, transparent: true, opacity: 0.24 }),
        new THREE.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.18 }),
      ];

      const ringA = new THREE.Mesh(
        new THREE.TorusGeometry(2.05, 0.03, 20, 160),
        ringMaterials[0]
      );
      ringA.rotation.x = Math.PI * 0.42;

      const ringB = new THREE.Mesh(
        new THREE.TorusGeometry(2.38, 0.026, 20, 160),
        ringMaterials[1]
      );
      ringB.rotation.x = Math.PI * 0.34;
      ringB.rotation.z = 0.78;

      const ringC = new THREE.Mesh(
        new THREE.TorusGeometry(2.74, 0.022, 20, 160),
        ringMaterials[2]
      );
      ringC.rotation.x = Math.PI * 0.48;
      ringC.rotation.z = -0.54;

      rings.add(ringA, ringB, ringC);

      const nodeGroup = new THREE.Group();
      const nodeGeometry = new THREE.SphereGeometry(0.075, 12, 12);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0xe8f4ff,
        transparent: true,
        opacity: 0.9,
      });

      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI * 2 * index) / 6;
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(Math.cos(angle) * 2.05, Math.sin(angle) * 2.05, 0);
        nodeGroup.add(node);
      }

      nodeGroup.rotation.x = Math.PI * 0.42;
      rings.add(nodeGroup);

      const particleCount = lowPowerDevice ? 96 : 180;
      const particlePositions = new Float32Array(particleCount * 3);

      for (let index = 0; index < particleCount; index += 1) {
        const stride = index * 3;
        const radius = THREE.MathUtils.randFloat(2.3, 4.2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(THREE.MathUtils.randFloatSpread(1.25));

        particlePositions[stride] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[stride + 1] = radius * Math.cos(phi) * 0.72;
        particlePositions[stride + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }

      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xbfe7ff,
        transparent: true,
        opacity: 0.28,
        size: lowPowerDevice ? 0.05 : 0.06,
        sizeAttenuation: true,
        depthWrite: false,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      world.add(particles);

      const plaqueGroup = new THREE.Group();
      world.add(plaqueGroup);

      const plaqueBody = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.92, 0.24),
        new THREE.MeshPhysicalMaterial({
          color: 0x0a0f18,
          emissive: 0x15263d,
          emissiveIntensity: 0.18,
          metalness: 0.6,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.18,
          transparent: true,
          opacity: 0.92,
        })
      );

      const textureLoader = new THREE.TextureLoader();
      const logoTexture = textureLoader.load("images/logo-white.png");
      logoTexture.colorSpace = THREE.SRGBColorSpace;
      logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const logoMaterial = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      });

      const logoGlowMaterial = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.54, 0.68), logoMaterial);
      logoPlane.position.z = 0.135;

      const logoGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.74), logoGlowMaterial);
      logoGlow.position.z = 0.14;

      plaqueGroup.add(plaqueBody, logoPlane, logoGlow);

      const linkMaterial = new THREE.LineBasicMaterial({
        color: 0x9ec1ff,
        transparent: true,
        opacity: 0.05,
      });
      const linkGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.6, 0.36, 0.1),
        new THREE.Vector3(-3.1, 1.02, -0.45),
        new THREE.Vector3(1.8, 0.18, 0.12),
        new THREE.Vector3(3.2, -0.84, -0.38),
        new THREE.Vector3(-0.82, -0.34, 0.18),
        new THREE.Vector3(-2.65, -1.34, -0.52),
      ]);
      const links = new THREE.LineSegments(linkGeometry, linkMaterial);
      world.add(links);

      shell.classList.add("is-webgl-ready");

      const resize = () => {
        const { width, height } = stageViewport.getBoundingClientRect();
        const safeWidth = Math.max(width, 1);
        const safeHeight = Math.max(height, 1);

        renderer.setSize(safeWidth, safeHeight, false);
        camera.aspect = safeWidth / safeHeight;
        camera.updateProjectionMatrix();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stageViewport);
      resize();

      let currentProgress = targetProgress;
      let inView = false;
      let frameId = 0;

      const render = (time = 0) => {
        if (!inView || document.hidden) {
          frameId = 0;
          return;
        }

        frameId = window.requestAnimationFrame(render);

        currentProgress += (targetProgress - currentProgress) * 0.08;

        const t = time * 0.001;
        const reveal = ease(mapRange(currentProgress, 0.02, 0.28));
        const orbit = ease(mapRange(currentProgress, 0.18, 0.58));
        const brand = ease(mapRange(currentProgress, 0.42, 0.78));
        const sync = ease(mapRange(currentProgress, 0.62, 0.92));
        const settle = ease(mapRange(currentProgress, 0.84, 1));

        world.rotation.x = 0.18 - currentProgress * 0.12 + Math.sin(t * 0.45) * 0.02;
        world.rotation.y = -0.28 + currentProgress * 0.82 + Math.sin(t * 0.28) * 0.05;
        world.position.y = Math.sin(t * 0.9) * 0.06 - brand * 0.12;

        camera.position.z = 8.8 - brand * 1.45 - settle * 0.32;
        camera.position.y = 0.3 - settle * 0.12;
        camera.lookAt(0, 0, 0);

        const coreScale = 0.2 + reveal * 0.9 - brand * 0.12 + settle * 0.08;
        core.scale.setScalar(coreScale);
        core.rotation.x = t * 0.5 + currentProgress * 1.8;
        core.rotation.y = t * 0.35 + currentProgress * 1.2;
        coreMaterial.emissiveIntensity = 0.14 + orbit * 0.58 + settle * 0.2;

        glow.scale.setScalar(0.3 + reveal * 1.12 + orbit * 0.08);
        glowMaterial.opacity = 0.05 + reveal * 0.18 + orbit * 0.08 - settle * 0.03;

        shellMesh.scale.setScalar(0.2 + reveal * 1.42 + orbit * 0.24);
        shellMesh.rotation.x = -t * 0.2 + orbit * 0.2;
        shellMesh.rotation.y = t * 0.16 + currentProgress * 1.15;
        shellMaterial.opacity = 0.08 + reveal * 0.26 + orbit * 0.12 - settle * 0.08;

        rings.scale.setScalar(0.35 + orbit * 0.92 + sync * 0.08);
        rings.rotation.z = t * 0.08 + currentProgress * 0.45;
        ringA.rotation.z = t * 0.22 + orbit * 0.85;
        ringB.rotation.z = 0.78 - t * 0.17 - currentProgress * 0.65;
        ringC.rotation.z = -0.54 + t * 0.12 + orbit * 0.52;
        ringMaterials[0].opacity = 0.05 + orbit * 0.3 + sync * 0.1 - settle * 0.1;
        ringMaterials[1].opacity = 0.04 + orbit * 0.24 + sync * 0.08 - settle * 0.08;
        ringMaterials[2].opacity = 0.03 + orbit * 0.17 + sync * 0.06 - settle * 0.06;
        nodeMaterial.opacity = 0.12 + orbit * 0.72 - settle * 0.12;
        nodeGroup.rotation.z = -t * 0.24 + currentProgress * 0.4;

        particles.rotation.y = t * 0.08 + currentProgress * 0.74;
        particles.rotation.x = 0.62 + t * 0.04;
        particles.scale.setScalar(0.82 + reveal * 0.28 + orbit * 0.12);
        particlesMaterial.opacity = 0.06 + reveal * 0.12 + orbit * 0.16 - settle * 0.04;

        plaqueGroup.position.set(0, 0.78 - brand * 0.7, -0.2 + brand * 0.98);
        plaqueGroup.rotation.x = 0.98 - brand * 0.96 + settle * 0.06;
        plaqueGroup.rotation.y = -1.08 + brand * 1.02 + settle * 0.24;
        plaqueGroup.scale.setScalar(0.42 + brand * 0.92 + settle * 0.03);
        plaqueBody.material.opacity = 0.12 + brand * 0.8;
        plaqueBody.material.emissiveIntensity = 0.06 + brand * 0.12 + settle * 0.12;
        logoMaterial.opacity = 0.04 + brand * 0.96;
        logoGlowMaterial.opacity = 0.02 + brand * 0.18 + settle * 0.06;

        links.scale.setScalar(0.2 + sync * 0.8);
        linkMaterial.opacity = 0.03 + sync * 0.48 - settle * 0.04;

        renderer.render(scene, camera);
      };

      const startRender = () => {
        if (!frameId) {
          frameId = window.requestAnimationFrame(render);
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting;

            if (inView) {
              startRender();
            }
          });
        },
        {
          rootMargin: "240px 0px",
        }
      );

      observer.observe(section);

      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && inView) {
          startRender();
        }
      });

      if (typeof reduceMotionQuery.addEventListener === "function") {
        reduceMotionQuery.addEventListener("change", (event) => {
          if (event.matches) {
            observer.disconnect();
            resizeObserver.disconnect();
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            renderer.dispose();
            shell.classList.remove("is-webgl-ready");
          }
        });
      }
    } catch (error) {
      console.error("Signal scene failed to initialize.", error);
    }
  }
}
