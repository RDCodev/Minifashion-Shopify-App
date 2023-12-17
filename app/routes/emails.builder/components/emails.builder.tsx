import {
  Tag,
  FormLayout,
  Button,
  TextField,
  InlineStack,
  BlockStack
} from "@shopify/polaris"
import { forwardRef, useCallback, useState } from "react"

const EmailsBuilder = forwardRef(({ offerProducts }: { offerProducts: any[] }, ref) => {

  //const [template, setTemplate] = useState({...emailTemplateConfig})
  const [collection, setCollection] = useState("")
  const [discount, setDiscount] = useState('0')
  const [body, setBody] = useState("")
  const [products, setProducts] = useState()

  const handleCollectionChange = useCallback((collection: any) => setCollection(collection), [])
  const handleDiscountChange = useCallback((discount: any) => setDiscount(discount), [])
  const handleBodyChange = useCallback((body: any) => setBody(body), [])
  const handleProductsChange = useCallback((products: any) => setProducts(products), [])

  const tagMarkup = offerProducts.map(({ id, value }) => (
    <Tag key={id}>{value}</Tag>
  ))

  /* const handleSubmit = useCallback(() => {
    setCollection(''); setDiscount('0'); setBody(''); setActive(false);
  }, []) */

  return (
    <>
      <FormLayout>
        <BlockStack gap="300">
          <InlineStack gap="200">
            <TextField
              label="products"
              name="products"
              labelHidden={true}
              value={products}
              onChange={handleProductsChange}
              autoComplete="off"
              multiline={false}
              verticalContent={tagMarkup}
            />
          </InlineStack>
          <TextField
            label="Collection Name"
            name="collection"
            value={collection}
            onChange={handleCollectionChange}
            autoComplete="off"
          />
          <TextField
            label="Discount"
            name="discount"
            type="number"
            value={discount}
            onChange={handleDiscountChange}
            autoComplete="off"
          />
          <TextField
            label="Body"
            name="body"
            value={body}
            onChange={handleBodyChange}
            multiline={4}
            autoComplete="off"
          />
        </BlockStack>
        <Button variant="primary" submit>Submit</Button>
      </FormLayout>
    </>
  )
})

export default EmailsBuilder