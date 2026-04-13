import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { cart, getCartTotal, clearCart } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrderMutation = trpc.order.create.useMutation();

  const total = getCartTotal();

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Empty Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your cart is empty. Please add items before checking out.
            </p>
            <Button onClick={() => navigate("/menu")} className="w-full">
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    setIsProcessing(true);

    try {
      const orderResponse = await createOrderMutation.mutateAsync({
        tableNumber: parseInt(tableNumber, 10),
        totalAmount: total,
        items: cart.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity,
          priceAtPurchase: item.price,
        })),
      });

      clearCart();
      navigate(`/receipt/${orderResponse.orderId}`);
      toast.success("Order created successfully!");
    } catch (error) {
      toast.error("Failed to create order");
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Enter your table number and confirm your order</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div>
                    <Label htmlFor="tableNumber">Table Number *</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      min="1"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="e.g., 5"
                      required
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Enter the table number where you are seated
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                      {cart.map(item => (
                        <div key={item.foodId} className="flex justify-between text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-accent text-lg">${(total / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/menu")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isProcessing} className="flex-1 gap-2">
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                      Place Order
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.foodId} className="flex justify-between text-sm">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
