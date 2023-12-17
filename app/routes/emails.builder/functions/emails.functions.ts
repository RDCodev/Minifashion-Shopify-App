import { capatilize } from "~/utils/app.utils"

export const retrieveCommonObjectByFields = (source: any[], retrieveSize: number = 5, fields: any[]) => {
  
  const commonObjects = source.reduce((array, { node }: any) => {
    
    if (fields.includes(node.productType) || fields.includes(node.vendor))
      array.push({ 
        value: capatilize(node.title), 
        id: node.id.split('/').splice(-1)[0],
        price: node.priceRangeV2.maxVariantPrice.amount,
        url: node.featuredImage || ''
      })

    return array
  }, [])

  return commonObjects.sort(() => Math.random() - 0.5).slice(0, retrieveSize)
}