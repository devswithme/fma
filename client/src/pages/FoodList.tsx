import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";

export default function FoodList() {
  const [, navigate] = useLocation();
  const {
    cart,
    addToCart: addItemToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();
  const [showCart, setShowCart] = useState(false);

  const { data: foods, isLoading } = trpc.food.list.useQuery();

  const handleAddToCart = (food: {
    id: number;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
  }) => {
    if (food.stock <= 0) {
      toast.error("This item is out of stock");
      return;
    }

    const existingItem = cart.find(item => item.foodId === food.id);

    if (existingItem) {
      if (existingItem.quantity >= food.stock) {
        toast.error("Not enough stock available");
        return;
      }
      updateQuantity(food.id, existingItem.quantity + 1);
    } else {
      addItemToCart({
        foodId: food.id,
        name: food.name,
        price: food.price,
        quantity: 1,
        imageUrl: food.imageUrl ?? undefined,
      });
    }
    toast.success(`${food.name} added to cart`);
  };

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Our Menu</h1>
            <p className="text-muted-foreground mt-2">Browse and order delicious food</p>
          </div>
          <Button
            onClick={() => setShowCart(!showCart)}
            variant="outline"
            className="gap-2 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods?.map(food => (
              <Card key={food.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {food.imageUrl && (
                  <img src={food.imageUrl} alt={food.name} className="w-full h-48 object-cover" />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{food.name}</CardTitle>
                  <CardDescription>{food.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-accent">
                      ${(food.price / 100).toFixed(2)}
                    </span>
                    <Badge variant={food.stock > 0 ? "default" : "destructive"}>
                      {food.stock > 0 ? `${food.stock} in stock` : "Out of stock"}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(food)}
                    className="w-full gap-2"
                    disabled={food.stock <= 0 || food.isAvailable === 0}
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-end">
            <Card className="w-full md:w-96 md:mr-8 md:mb-8 max-h-[80vh] overflow-y-auto rounded-t-xl md:rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Cart</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.foodId} className="flex gap-4 border-b pb-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${(item.price / 100).toFixed(2)} each
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto text-destructive"
                                onClick={() => removeFromCart(item.foodId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-accent">${(cartTotal / 100).toFixed(2)}</span>
                      </div>
                      <Button className="w-full gap-2" onClick={handleCheckout}>
                        <ShoppingCart className="w-4 h-4" />
                        Proceed to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
