import ParticleBackgroundV1 from "@/components/features/particles/particle-background-v1";
import PageLayout from "@/components/layouts/page-layout";

export default function HomePage() {
  return (
    <PageLayout>
      <ParticleBackgroundV1 />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none" style={{ zIndex: 10 }}>
        <h1 className="text-7xl font-bold text-[#0e101a] mb-6 tracking-tighter">
          Particle Antigravity
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Experience the magic of particle interactions
        </p>
        <p className="text-lg text-gray-500 max-w-2xl">
          Move your mouse to interact with the particles and explore the breathing effect
        </p>
      </div>
    </PageLayout>
  );
}
