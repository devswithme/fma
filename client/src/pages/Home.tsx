import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { LOGIN_PATH } from "@/const";
import { ChefHat, ShoppingCart, Lock, Zap } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">FoodHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/menu")}>
              Menu
            </Button>
            {user?.role === "admin" && (
              <Button variant="ghost" onClick={() => navigate("/admin")}>
                Admin
              </Button>
            )}
            {!loading && !user && (
              <Button onClick={() => navigate(LOGIN_PATH)}>Sign In</Button>
            )}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="outline" size="sm" onClick={() => void logout()}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-4xl">
          <div className="text-center space-y-6 mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Order Delicious Food
              <span className="text-accent block">Instantly</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our elegant menu, add items to your cart, and enjoy seamless checkout with secure Stripe payments.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/menu")}
                className="gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Ordering
              </Button>
              {user?.role === "admin" && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 border-t border-b border-border">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose FoodHub?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <ChefHat className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Fresh & Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All items are carefully selected and prepared with the finest ingredients
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Fast & Easy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simple ordering process with just a few clicks. Quick checkout and instant confirmation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 bg-background hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Powered by Stripe for secure, encrypted payment processing
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-2xl text-center space-y-6">
          <h3 className="text-3xl font-bold text-foreground">
            Ready to Order?
          </h3>
          <p className="text-lg text-muted-foreground">
            Browse our complete menu and place your order now. Enjoy a seamless dining experience.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/menu")}
            className="gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            View Menu
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 FoodHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
