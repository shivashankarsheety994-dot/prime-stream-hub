import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "₹40",
    period: "/ month",
    tagline: "Best value for monthly access",
    features: ["Full HD streaming", "All categories", "Cancel anytime"],
    highlight: true,
  },
];

export default function Plans() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen relative px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top, hsl(0 84% 50% / 0.15), transparent 60%), radial-gradient(ellipse at bottom, hsl(0 0% 10%), hsl(0 0% 4%))",
        }}
      />
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your plan</h1>
          <p className="text-muted-foreground mt-2">Unlimited streaming. Cancel whenever you like.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 justify-items-center">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={
                `${p.highlight
                  ? "relative border-primary/60 bg-card/80 backdrop-blur shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)]"
                  : "relative bg-card/60 backdrop-blur"} w-full max-w-md`
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Best Value
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <CardDescription>{p.tagline}</CardDescription>
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-11 font-semibold"
                  variant={p.highlight ? "default" : "secondary"}
                  onClick={() =>
                    toast({
                      title: "Coming soon",
                      description: `Payments for the ${p.name} plan aren't enabled yet.`,
                    })
                  }
                >
                  Choose {p.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-8">
          Prices in INR. Payments will be enabled soon.
        </p>
      </div>
    </main>
  );
}