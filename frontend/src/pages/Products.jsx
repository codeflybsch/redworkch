import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check, Star } from "lucide-react";

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Products error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleOrder = async (product, duration) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await api.post("/orders", {
        productId: product.id,
        duration,
        quantity: 1
      });
      alert(`Bestellung erfolgreich! Bestellung #${res.data.id}`);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Bestellung fehlgeschlagen: " + err.response?.data?.detail);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  // Group products by category
  const categories = {};
  products.forEach(product => {
    const cat = product.categoryName || "Sonstige";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(product);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hosting-Pakete</h1>
          <p className="text-xl text-gray-600">Wählen Sie das perfekte Hosting-Paket für Ihre Bedürfnisse</p>
        </div>

        {Object.entries(categories).map(([category, prods]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {prods.map((product) => (
                <Card key={product.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {product.name}
                      {product.name.includes("Professional") && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Beliebt
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-3xl font-bold text-[#E63946]">
                      CHF {product.unitPrice}
                      <span className="text-sm font-normal text-gray-600">/{product.unit}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      {/* Mock features */}
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">SSL-Zertifikat inklusive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">24/7 Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Tägliche Backups</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleOrder(product, "monthly")}
                      >
                        Monatlich bestellen - CHF {product.unitPrice}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleOrder(product, "yearly")}
                      >
                        Jährlich bestellen - CHF {(product.unitPrice * 12 * 0.9).toFixed(2)}
                        <Badge variant="secondary" className="ml-2">-10%</Badge>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}