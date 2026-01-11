'use server'

interface WooliesProduct {
  TileID: number;
  Stockcode: number;
  Name: string;
  Price: number;
  IsAvailable: boolean;
  PackageSize: string; // e.g. "1kg"
}

export async function searchWoolies(searchTerm: string) {
  // 1. The "Hidden" API Endpoint
  const endpoint = 'https://www.woolworths.com.au/apis/ui/Search/products';

  // 2. We must pretend to be a real browser (User-Agent is critical)
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.woolworths.com.au',
    'Referer': 'https://www.woolworths.com.au'
  };

  // 3. The Payload they expect
  const payload = {
    SearchTerm: searchTerm,
    PageSize: 10,
    PageNumber: 1,
    SortType: "Relevance",
    Location: "/shop/search/products",
    IsSpecial: false,
    Filters: [],
    LocationId: 0 // Default store
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      next: { revalidate: 0 } // Don't cache live prices
    });

    if (!response.ok) {
      console.error("Woolies API Error:", response.status, await response.text());
      return { error: 'Failed to connect to supermarket' };
    }

    const data = await response.json();
    
    // 4. Clean up the messy data they return
    const products: WooliesProduct[] = data.Products
      ?.filter((p: any) => p.Products && p.Products[0]) // Filter out ads/empty tiles
      .map((p: any) => {
        const item = p.Products[0]; // They nest products inside 'Products' array
        return {
          Stockcode: item.Stockcode,
          Name: item.DisplayName || item.Name,
          Price: item.Price,
          IsAvailable: item.IsAvailable,
          PackageSize: item.PackageSize
        };
      });

    return { products };

  } catch (err) {
    console.error(err);
    return { error: 'Failed to fetch prices' };
  }
}