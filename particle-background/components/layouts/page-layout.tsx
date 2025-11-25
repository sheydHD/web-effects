import { ReactNode } from 'react';
import Header from '@/components/ui/header';

interface PageLayoutProps {
    children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className="relative min-h-screen">
            <Header />
            {children}
        </div>
    );
}
