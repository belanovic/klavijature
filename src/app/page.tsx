
"use client"; 

import VirtualPiano from '@/components/piano/VirtualPiano';

export default function HomePage() {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="container mx-auto flex flex-col items-center justify-center flex-grow">
        <header className="my-6 text-center"> {/* Smanjena margina za manji header */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary"> {/* Smanjena veličina fonta */}
            Virtual Virtuoso
          </h1>
          {/* Uklonjen opisni paragraf ispod naslova */}
        </header>
        
        <section className="w-full my-4 md:my-8" aria-label="Interactive Piano Keyboard">
          <VirtualPiano />
        </section>

        {/* Uklonjen footer deo */}
      </div>
    </main>
  );
}
