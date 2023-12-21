
import {
  Tag,
  FormLayout,
  Button,
  TextField,
  InlineStack,
  BlockStack,
  Form,
  Text,
} from "@shopify/polaris"
import { forwardRef, useCallback, useState } from "react"
import { AWS_ENDPOINTS, emailTemplateConfig } from "~/utils/api.aws"

const EmailsBuilder = forwardRef(({ emails, offerProducts, wrapperState, onSend }: { emails: any, offerProducts: any[], wrapperState: any, onSend: any }, ref) => {

  //const deliverEmails = useFetcher()

  const [deliver, setDeliver] = useState(false)
  const [template, setTemplate] = useState({ ...emailTemplateConfig })
  const [collection, setCollection] = useState("")
  const [discount, setDiscount] = useState('0')
  const [body, setBody] = useState("")

  const handleCollectionChange = useCallback((collection: any) => setCollection(collection), [])
  const handleDiscountChange = useCallback((discount: any) => setDiscount(discount), [])
  const handleBodyChange = useCallback((body: any) => setBody(body), [])

  const tagMarkup = offerProducts.map(({ id, value }) => (
    <Tag key={id}>{value}</Tag>
  ))

  const calculateDiscountProduct = (discount: number, productPrice: number) => {

    if (!discount) throw new Error(`Discount can't be zero, please change the amount.`)

    return (productPrice - (productPrice * (discount / 100))).toFixed(2)
  }

  const handleSubmit = useCallback( async (event: any) => {

    const TemplateData: any = {
      name: emails.name,
      collection,
      discount,
      body,
      products: offerProducts.reduce((arr: any[], { value, price, url }: any) => {

        const productOffer = {
          title_product: value,
          previous_price_product: price,
          current_price_product: calculateDiscountProduct(Number(discount), Number(price)),
          product_image_url: url.url
        }

        return [...arr, productOffer]
      }, [])
    }

    const Destination = {
      ToAddresses: [
        emails.email
      ]
    }

    const templateDeliver = {
      ...template,
      TemplateData,
      Destination
    }

    setTemplate(templateDeliver)
    setDeliver(true)

    try {
      await fetch(AWS_ENDPOINTS.deliverEmails(), {
        method: 'POST',
        body: JSON.stringify(templateDeliver),
        mode: 'no-cors'
      })

      onSend(true)
    } catch (error) {

    } finally {
      setDeliver(false)
      wrapperState(false)
    }

    /* deliverEmails.submit({
      templateDeliver
    },{
      method: 'POST',
      action: 'apps/aws/emails'
    }) */

  }, [emails.name, emails.email, collection, discount, body, offerProducts, template, onSend, wrapperState])


  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              Offer Products:
            </Text>
            <InlineStack gap="200">
              {tagMarkup}
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
          <Button variant="primary" submit loading={deliver}>Submit</Button>
        </FormLayout>
      </Form>
    </>
  )
})

export default EmailsBuilder
