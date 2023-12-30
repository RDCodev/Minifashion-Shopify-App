import { BlockStack, Button, Form, TextField, Text, InlineStack, Badge, FormLayout, Divider } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { retrieveCommonObjectByFields } from "~/routes/emails.builder/functions/emails.functions";
import { dotReplace } from "~/utils/app.utils";


export default function RecommendProducts({ customers, products }: any) {

  const [body, setBody] = useState("")
  const [collection, setCollection] = useState("")
  const [discount, setDiscount] = useState("0")
  const [deliver, setDeliver] = useState(true)

  const handleCollectionChange = useCallback((collection: any) => setCollection(collection), [])
  const handleDiscountChange = useCallback((discount: any) => setDiscount(discount), [])
  const handleBodyChange = useCallback((body: any) => setBody(body), [])

  const customerProductsRecommend = customers.reduce((arr: any[], { common_products, favorite_vendors }: any) => {
    const recommendations = retrieveCommonObjectByFields(products, 3, [...common_products, ...favorite_vendors])
    return [...arr, recommendations]
  }, [])

  const productsRecommend = customerProductsRecommend.flat(Infinity)

  const customerMarkup = () => (
    <InlineStack gap="100">
      {
        customers.slice(0, 3).map(({ customer }: any) => (
          <Badge key={customer}>{customer}</Badge>
        ))
      }
      {
        customers.length <= 3 ? null :
          (
            <Badge tone="info">
              {
                `... more ${customers.length - 3}`
              }
            </Badge>
          )
      }
    </InlineStack>
  )

  const productsMarkup = () => (
    <InlineStack gap="100">
      {
        productsRecommend.slice(0, 3).map(({ value }: any) => (
          <Badge key={value}>{dotReplace(value, 20)}</Badge>
        ))
      }
      {
        productsRecommend.length <= 3 ? null :
          (
            <Badge tone="info">
              {
                `... more ${productsRecommend.length - 3}`
              }
            </Badge>
          )
      }
    </InlineStack>
  )

  const handleSubmit = useCallback(() => {
    
  }, [])

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          <BlockStack gap="200">
            <InlineStack gap="200">
              <Text as="h3" variant="headingSm">
                Customers
              </Text>
              {customerMarkup()}
            </InlineStack>
            <InlineStack gap="200">
              <Text as="h3" variant="headingSm">
                Products
              </Text>
              {productsMarkup()}
            </InlineStack>
            <Divider />
            <TextField
              label="Collection Name"
              value={collection}
              onChange={handleCollectionChange}
              autoComplete="off"
            />
            <TextField
              type="number"
              label="Discount"
              value={discount}
              onChange={handleDiscountChange}
              autoComplete="off"
            />
            <TextField
              label="Body Template"
              value={body}
              multiline={4}
              onChange={handleBodyChange}
              autoComplete="off"
            />
          </BlockStack>
          <Button variant="primary" submit >Submit</Button>
        </FormLayout>
      </Form>
    </>
  )
}