import ParticleBackgroundV2 from "@/components/ParticleBackgroundV2";
import Header from "@/components/Header";

export default function Version2() {
    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center">
            <Header />
            <ParticleBackgroundV2 />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none" style={{ zIndex: 10 }}>
                <h1 className="text-6xl font-bold text-black mb-4 tracking-tighter">
                    Antigravity V2
                </h1>
                <p className="text-xl text-gray-600">
                    Move your mouse to interact with the particles
                </p>
            </div>
        </main>
    );
}
