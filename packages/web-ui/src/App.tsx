import { DicesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-4">
        <DicesIcon className="h-16 w-16" />
        <h1 className="text-4xl font-bold tracking-tight">Dicecaster</h1>
        <p className="text-muted-foreground">Web UI coming soon...</p>
      </div>
      <Button size="lg">Roll Dice</Button>
    </div>
  );
}
