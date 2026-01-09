import type React from "react";

export const SITE_NAME = "Jie Wang";

export const PLAYGROUND_CATEGORIES = ["photography", "vibe-coding"] as const;

export type ResolvedTheme = "dark" | "light";
export type Theme = ResolvedTheme | "system";

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  technologies: string[];
  image: string; // Placeholder URL
  position: [number, number, number]; // x, y, z
}

export interface PlaygroundItem {
  id: string;
  title: string;
  type: "Shader" | "React Component" | "Algorithm" | "Design";
  description: string;
  code: string;
  preview: string; // Image URL
  position: [number, number, number];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  slug: string;
  excerpt: string;
  tags: string[];
  content: string;
}

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface MousePosition {
  x: number;
  y: number;
}

export const PROJECTS: Project[] = [
  {
    id: "01",
    title: "Neuro-Genesis",
    category: "Generative Art",
    year: "2024",
    description:
      "A real-time visualization of neural network pathways using WebGL instancing. 50,000 particles reacting to audio input.",
    technologies: ["Three.js", "GLSL", "WebAudio API"],
    image: "https://picsum.photos/800/600?grayscale&blur=2",
    position: [0, 0, 0],
  },
  {
    id: "02",
    title: "Vortex Data",
    category: "Data Viz",
    year: "2023",
    description:
      "Climate change data transformed into a navigable 3D vortex. Immersive storytelling through raw dataset manipulation.",
    technologies: ["D3.js", "React Three Fiber", "Python"],
    image: "https://picsum.photos/800/600?grayscale&blur=2",
    position: [5, 2, 0],
  },
  {
    id: "03",
    title: "Echo Chamber",
    category: "Installation",
    year: "2023",
    description:
      "Physical installation using Kinect depth sensors and projection mapping to create digital shadows that lag in time.",
    technologies: ["TouchDesigner", "Kinect", "Projection Mapping"],
    image: "https://picsum.photos/800/600?grayscale&blur=2",
    position: [-5, 3, 0],
  },
  {
    id: "04",
    title: "Synthetix UI",
    category: "Interface Design",
    year: "2022",
    description:
      "A speculative OS design for a post-screen future. Entirely gestural and spatial interface concepts.",
    technologies: ["Framer Motion", "React", "SVG"],
    image: "https://picsum.photos/800/600?grayscale&blur=2",
    position: [3, -4, 0],
  },
];

export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  {
    id: "snp-01",
    title: "Raymarching SDFs",
    type: "Shader",
    description:
      "Basic signed distance field implementation for rendering a smooth sphere.",
    preview: "https://picsum.photos/id/17/400/400",
    position: [0, 0, 0],
    code: `float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(p, -1.5));
    
    float t = 0.0;
    for(int i=0; i<64; i++) {
        vec3 p = ro + t*rd;
        float d = sdSphere(p, 1.0);
        if(d<0.001) break;
        t += d;
    }
    
    vec3 col = vec3(0.0);
    if(t<10.0) {
        vec3 pos = ro + t*rd;
        vec3 nor = normalize(pos);
        col = 0.5 + 0.5*nor;
    }
    fragColor = vec4(col,1.0);
}`,
  },
  {
    id: "snp-02",
    title: "Fluid Simulation",
    type: "Algorithm",
    description:
      "Navier-Stokes equation solver running on the CPU for educational purposes.",
    preview: "https://picsum.photos/id/28/400/400",
    position: [4, 2, 0],
    code: `class Fluid {
  constructor(size, dt, diffusion, viscosity) {
    this.size = size;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;
    this.s = new Array(size * size).fill(0);
    this.density = new Array(size * size).fill(0);
    this.Vx = new Array(size * size).fill(0);
    this.Vy = new Array(size * size).fill(0);
  }

  step() {
    // ... diffusion step
    // ... advection step
    // ... projection step
  }
}`,
  },
  {
    id: "snp-03",
    title: "Kinetic Typography",
    type: "React Component",
    description:
      "Interactive text that displaces based on mouse proximity using Framer Motion.",
    preview: "https://picsum.photos/id/45/400/400",
    position: [-3, -2, 0],
    code: `const KineticText = ({ children }) => {
  const mouse = useMousePosition();
  const ref = useRef(null);
  
  return (
    <motion.h1
      ref={ref}
      animate={{
        x: (mouse.x - ref.current.x) * 0.1,
        y: (mouse.y - ref.current.y) * 0.1
      }}
    >
      {children}
    </motion.h1>
  )
}`,
  },
  {
    id: "snp-04",
    title: "Procedural Terrain",
    type: "Shader",
    description: "FBM noise generated terrain with height-based coloring.",
    preview: "https://picsum.photos/id/56/400/400",
    position: [2, -4, 0],
    code: `float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}`,
  },
  {
    id: "snp-05",
    title: "React Spring Hooks",
    type: "React Component",
    description: "Custom hooks for physics-based animations.",
    preview: "https://picsum.photos/id/88/400/400",
    position: [-5, 3, 0],
    code: `const useSpring = (targetValue) => {
  const [value, setValue] = useState(targetValue);
  // Physics logic here...
  return value;
}`,
  },
];

export const TECH_STACK = [
  { name: "WebGL / GLSL", level: 95 },
  { name: "React / R3F", level: 90 },
  { name: "Typescript", level: 90 },
  { name: "Node.js", level: 80 },
  { name: "Rust / Wasm", level: 60 },
  { name: "Generative AI", level: 85 },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "01",
    title: "The Latent Space of Dreams",
    date: "2024.03.15",
    readTime: "5 min",
    slug: "latent-space-dreams",
    excerpt:
      "Exploring the aesthetic implications of high-dimensional vector spaces in generative art and how we can navigate them intuitively.",
    tags: ["AI", "Theory", "Art"],
    content:
      "Generative art has always been about navigating spaces of possibility...",
  },
  {
    id: "02",
    title: "Beyond the DOM: Canvas First",
    date: "2024.02.01",
    readTime: "8 min",
    slug: "beyond-dom",
    excerpt:
      "Why standard HTML elements fail to capture the fluidity of modern interactive experiences and moving towards a WebGL-native web.",
    tags: ["WebGL", "Engineering"],
    content: "The Document Object Model (DOM) was built for documents...",
  },
  {
    id: "03",
    title: "Shader Metamorphosis",
    date: "2024.01.20",
    readTime: "4 min",
    slug: "shader-morph",
    excerpt:
      "Techniques for organic vertex displacement using noise fields and feedback loops to create living, breathing digital surfaces.",
    tags: ["GLSL", "Tutorial"],
    content: "Vertex displacement is one of the most powerful tools...",
  },
];
