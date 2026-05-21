import { Header } from "@/components/Header";

const WebSeries = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16 pt-20 relative z-10 px-4">
        <div className="text-center py-32 px-4">
          <h2 className="text-2xl font-bold mb-2">Web Series Coming Soon</h2>
          <p className="text-muted-foreground">
            This feature is under development and will be available soon.
          </p>
        </div>
      </main>
    </div>
  );
};

export default WebSeries;
