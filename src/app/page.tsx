
"use client"; 

import VirtualPiano from '@/components/piano/VirtualPiano';

export default function HomePage() {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="container mx-auto flex flex-col items-center justify-center flex-grow w-full">
        {/* Header section removed */}
        
        <section className="w-full my-4 md:my-8 flex-grow flex items-center justify-center" aria-label="Interactive Piano Keyboard">
          <VirtualPiano />
        </section>
      </div>
    </main>
  );
}
