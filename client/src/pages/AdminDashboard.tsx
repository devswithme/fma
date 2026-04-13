import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const { data: foods, isLoading, refetch } = trpc.food.list.useQuery();
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = trpc.order.list.useQuery();
  const createMutation = trpc.food.create.useMutation();
  const updateMutation = trpc.food.update.useMutation();
  const deleteMutation = trpc.food.delete.useMutation();
  const statusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order updated");
      void refetchOrders();
      void refetch();
    },
    onError: () => toast.error("Failed to update order"),
  });

  // Redirect if not admin
  if (!authLoading && (!user || user.role !== "admin")) {
    navigate("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const handleOpenDialog = (food?: any) => {
    if (food) {
      setEditingId(food.id);
      setFormData({
        name: food.name,
        description: food.description || "",
        price: (food.price / 100).toString(),
        stock: food.stock.toString(),
        imageUrl: food.imageUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceInCents = Math.round(parseFloat(formData.price) * 100);

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name || undefined,
          description: formData.description || undefined,
          price: priceInCents || undefined,
          stock: parseInt(formData.stock) || undefined,
          imageUrl: formData.imageUrl || undefined,
          isAvailable: 1,
        });
        toast.success("Food item updated successfully");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: priceInCents,
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl,
          isAvailable: 1,
        });
        toast.success("Food item created successfully");
      }
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save food item");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Food item deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete food item");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage menu items and customer orders</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="menu">Menu items</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="mt-0">
              <div className="flex justify-end mb-4">
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Food Item
                  </Button>
                </DialogTrigger>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : foods && foods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foods.map(food => (
                    <Card key={food.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {food.imageUrl && (
                        <img src={food.imageUrl} alt={food.name} className="w-full h-48 object-cover" />
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{food.name}</CardTitle>
                        <CardDescription>{food.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-semibold text-lg">${(food.price / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stock</p>
                            <p
                              className={`font-semibold text-lg ${food.stock > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {food.stock}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(food)}
                            className="flex-1 gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(food.id)}
                            className="flex-1 gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      No food items yet. Create your first item to get started.
                    </p>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleOpenDialog()}>Create First Item</Button>
                    </DialogTrigger>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : orders && orders.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent orders</CardTitle>
                    <CardDescription>Newest first. Update status as you fulfill orders.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Table</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Placed</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(o => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">{o.id}</TableCell>
                            <TableCell>{o.tableNumber}</TableCell>
                            <TableCell>${(o.totalAmount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  o.status === "completed"
                                    ? "default"
                                    : o.status === "cancelled"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {o.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {new Date(o.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap justify-end gap-1">
                                {o.status === "pending" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={statusMutation.isPending}
                                      onClick={() =>
                                        statusMutation.mutate({
                                          orderId: o.id,
                                          status: "completed",
                                        })
                                      }
                                    >
                                      Complete
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive"
                                      disabled={statusMutation.isPending}
                                      onClick={() =>
                                        statusMutation.mutate({
                                          orderId: o.id,
                                          status: "cancelled",
                                        })
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">No orders yet. They appear here after customers check out.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Food Item" : "Add New Food Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Food Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Margherita Pizza"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the food item..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="9.99"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                )}
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update Item" : "Create Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
