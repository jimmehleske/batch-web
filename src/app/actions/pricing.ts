'use server'

export async function searchWoolies(searchTerm: string) {
  const API_KEY = 'c35e590b5bd54c132dcfa8139b53809e92df140d'; // Your Key
  
  // We target the search page directly
  const targetUrl = `https://www.woolworths.com.au/shop/search/products?searchTerm=${encodeURIComponent(searchTerm)}`;
  
  // We ask ZenRows to:
  // 1. Visit the URL
  // 2. Render JavaScript (Woolies is a JS app)
  // 3. Act like a Human (antibot)
  // 4. Auto-extract the product data (autoparse)
  const zenRowsUrl = `https://api.zenrows.com/v1/?apikey=${API_KEY}&url=${encodeURIComponent(targetUrl)}&js_render=true&antibot=true&autoparse=true`;

  try {
    console.log(`Scanning Woolies for: ${searchTerm}...`);
    
    const response = await fetch(zenRowsUrl, { 
      cache: 'no-store' // Always get fresh prices
    });

    if (!response.ok) {
      console.error("ZenRows Error:", response.status);
      return { error: 'Supermarket blocked the connection. Try again.' };
    }

    const data = await response.json();
    
    // ZenRows 'autoparse' usually finds a list of items.
    // We map their generic structure to our app's structure.
    const products = data.map((item: any) => ({
      Stockcode: Math.random(), // We don't get real IDs from scraping, so we fake one for the key
      Name: item.title || item.name || 'Unknown Product',
      Price: parsePrice(item.price),
      PackageSize: '', // Scrapers often miss this specific detail
      IsAvailable: true
    })).filter((p: any) => p.Price > 0); // Remove items with no price found

    return { products };

  } catch (err) {
    console.error(err);
    return { error: 'Failed to fetch prices' };
  }
}

// Helper to clean up price strings like "$5.50 each" -> 5.50
function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  
  // Remove '$', 'each', whitespace, etc.
  const clean = priceStr.replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}