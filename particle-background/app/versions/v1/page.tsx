import ParticleBackgroundV1 from "@/components/features/particles/particle-background-v1";
import PageLayout from "@/components/layouts/page-layout";

export default function Version1Page() {
    return (
        <PageLayout>
            <ParticleBackgroundV1 />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none" style={{ zIndex: 10 }}>
                <h1 className="text-6xl font-bold text-[#0e101a] mb-4 tracking-tighter">
                    Antigravity V1
                </h1>
                <p className="text-xl text-gray-600">
                    Original breathing effect
                </p>
            </div>
        </PageLayout>
    );
}
