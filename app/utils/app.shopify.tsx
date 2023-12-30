export const SHOPIFY_APP_ID = 1354745
export const enum QueriesContexts {
  PRODUCTS = 'products',
  CUSTOMERS = 'customers'
}

export const grahpqlQueries = [
  {
    context: 'products',
    action: 'retrive',
    query: (limit: number) => `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              vendor
              productType
              tags
              featuredImage {
                url
              }
              priceRangeV2 {
                maxVariantPrice {
                  amount
                }
              }
            }
          }
        }
      }
    `
  }
]