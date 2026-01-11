'use server'

export async function searchWoolies(searchTerm: string) {
  const API_KEY = 'c35e590b5bd54c132dcfa8139b53809e92df140d';
  
  // STRATEGY CHANGE: 
  // Instead of fighting the Woolworths firewall directly, we ask Google Shopping.
  // We search specifically for "Woolworths [Item]" to get their pricing.
  const query = `Woolworths ${searchTerm}`;
  const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
  
  // We enable 'autoparse' which works perfectly on Google Shopping results
  const zenRowsUrl = `https://api.zenrows.com/v1/?apikey=${API_KEY}&url=${encodeURIComponent(targetUrl)}&autoparse=true&premium_proxy=true&antibot=true`;

  try {
    console.log(`Asking Google Shopping for: ${query}...`);
    
    const response = await fetch(zenRowsUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error("ZenRows Error:", response.status);
      return { error: 'Search failed. Please try again.' };
    }

    const data = await response.json();

    // The autoparse result for Google Shopping usually puts items in 'shopping_results' or 'organic_results'
    // We try to find the best list.
    const results = data.shopping_results || data.organic_results || [];

    const products = results.map((item: any) => ({
      Stockcode: Math.random(), // Fake ID
      Name: item.title,
      Price: parsePrice(item.price), // Extracts "$5.50" -> 5.50
      PackageSize: '', 
      IsAvailable: true,
      Source: item.source // e.g., "Woolworths"
    }))
    // Optional: Filter to only show Woolworths if you want to be strict
    // .filter((p: any) => p.Source && p.Source.includes('Woolworths'))
    .slice(0, 10); // Take top 10

    return { products };

  } catch (err) {
    console.error(err);
    return { error: 'Failed to fetch prices' };
  }
}

function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  
  // Google often returns "AUD 5.50" or "$5.50"
  const clean = priceStr.replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}