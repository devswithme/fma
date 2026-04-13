import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ChefHat, Loader2 } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const login = trpc.auth.loginWithPhone.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Signed in");
      navigate("/");
    },
    onError: err => {
      toast.error(err.message || "Sign in failed");
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <ChefHat className="w-8 h-8 text-accent" />
        <span className="text-2xl font-bold">FoodHub</span>
      </div>
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Enter the admin phone number to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              login.mutate({ phone });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="6512345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={login.isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground">
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() => navigate("/")}
        >
          Back to home
        </button>
      </p>
    </div>
  );
}
