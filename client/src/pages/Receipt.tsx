import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Printer, Home } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Receipt() {
  const [, params] = useRoute("/receipt/:orderId");
  const [isPrinting, setIsPrinting] = useState(false);

  const orderId = params?.orderId ? parseInt(params.orderId, 10) : null;

  const { data: order, isLoading } = trpc.order.getById.useQuery(orderId || 0, {
    enabled: !!orderId,
  });

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Unable to find your order. Please try again.
            </p>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The order you are looking for could not be found.
            </p>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl">
        <div className="mb-8 print:mb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-foreground">Order Confirmed</h1>
          </div>
          <p className="text-center text-muted-foreground">
            Your order has been successfully placed
          </p>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardHeader className="text-center border-b print:border-b">
            <CardTitle>Receipt</CardTitle>
            <CardDescription>Order #{order.id}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-semibold text-lg">#{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Table Number</p>
                <p className="font-semibold text-lg">{order.tableNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className="mt-1">
                  {order.status === "pending"
                    ? "Pending"
                    : order.status === "cancelled"
                      ? "Cancelled"
                      : "Completed"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.foodId} x {item.quantity}
                      </span>
                      <span>${(item.priceAtPurchase / 100).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No items in order</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(order.totalAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-accent">${(order.totalAmount / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Message */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground font-semibold">
                Thank you for your order!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your order will be prepared shortly. Please keep this receipt for reference.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 print:hidden">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 gap-2"
                disabled={isPrinting}
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="flex-1 gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
