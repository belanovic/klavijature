
import VirtualPiano from '@/components/piano/VirtualPiano';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="container mx-auto flex flex-col items-center justify-center flex-grow">
        <header className="my-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
            Virtual Virtuoso
          </h1>
          <p className="text-muted-foreground mt-3 text-lg md:text-xl max-w-2xl">
            Unleash your inner musician. Play the piano using your mouse, touchscreen, or computer keyboard.
          </p>
        </header>
        
        <section className="w-full my-4 md:my-8" aria-label="Interactive Piano Keyboard">
          <VirtualPiano />
        </section>

        <footer className="my-8 text-center text-sm text-muted-foreground">
          <div className="mb-4 p-4 border border-dashed border-border rounded-lg max-w-md mx-auto bg-card">
            <h2 className="font-semibold text-foreground mb-2">How to Play:</h2>
            <p>Click/tap on keys or use your computer keyboard.</p>
            <p className="mt-1">
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded">A S D F G H J K L ;</span> for white keys.
            </p>
            <p className="mt-1">
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded">W E T Y U O P</span> for black keys.
            </p>
          </div>
          <p>Built with Next.js, Tailwind CSS, and Tone.js.</p>
          <p>&copy; {new Date().getFullYear()} Virtual Virtuoso. All sounds reserved to their creators.</p>
        </footer>
      </div>
    </main>
  );
}