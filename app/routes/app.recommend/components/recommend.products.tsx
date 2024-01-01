import { BlockStack, Button, Form, TextField, Text, InlineStack, Badge, FormLayout, Divider } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { retrieveCommonObjectByFields } from "~/routes/emails.builder/functions/emails.functions";
import { AWS_ENDPOINTS, emailTemplateConfig } from "~/utils/api.aws";
import { calculateDiscountProduct } from "~/utils/app.shopify";
import { addHours, dotReplace } from "~/utils/app.utils";

const parseTemplateEmailCustomers = (customers: any, collection: any, discount: any, body: any, customerProductsRecommend: any, codes: any) => {
  return customers.reduce((arr: any[], {
    customer,
    email
  }: any, index: number) => {

    const TemplateData = {
      name: customer,
      collection,
      discount,
      body,
      discount_code: codes[index],
      products: customerProductsRecommend[index].reduce((arr: any[], { value, price, url }: any, index: number) => {
        const productOffer = {
          title_product: value,
          previous_price_product: price,
          current_price_product: calculateDiscountProduct(Number(discount), Number(price)),
          product_image_url: url.url
        }

        return [...arr, productOffer]
      }, []),
    }

    const Destination = {
      ToAddresses: [
        email
      ]
    }

    return [...arr, {
      ...emailTemplateConfig,
      TemplateData,
      Destination
    }]
  }, [])
}

const parseSubmitDiscount = (collection: any, percentage: any, customers: any, products: any) => {

  const today = new Date()

  const customerGID = customers.reduce((arr: any, customer: any) => {
    return [...arr, `gid://shopify/Customer/${customer.id}`]
  },[])

  const productsGID = products.flat(Infinity).reduce((arr: any, product: any) => {
    return [...arr, `gid://shopify/Product/${product.id}`]
  }, [])

  const template = {
    title: collection,
    code: "",
    startsAt: addHours(today, 0),
    endsAt: addHours(today, 1),
    customers: customerGID,
    percentage: (percentage / 100).toFixed(2),
    products: productsGID
  }

  return template
}

export default function RecommendProducts({ customers, products, onComplete, onError, wrapperModal, wrapperSubmit, codes }: any) {

  const [body, setBody] = useState("")
  const [collection, setCollection] = useState("")
  const [discount, setDiscount] = useState("0")
  const [customerProductsRecommend, setCustomerProductsRecommend] = useState<any[]>([])

  const handleCollectionChange = useCallback((collection: any) => setCollection(collection), [])
  const handleDiscountChange = useCallback((discount: any) => setDiscount(discount), [])
  const handleBodyChange = useCallback((body: any) => setBody(body), [])

  const customerProducts = useCallback((customers: any) => {
    setCustomerProductsRecommend(
      customers.reduce((arr: any[], { common_products, favorite_vendors }: any) => {
        const recommendations = retrieveCommonObjectByFields(products, 3, [...common_products, ...favorite_vendors])
        return [...arr, recommendations]
      }, []))
  }, [products])

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

  useEffect(() => {
    handleSubmit(codes)
  }, [codes])

  useEffect(() => {
    customerProducts(customers)
  }, [customerProducts, customers])

  const handleSubmitDiscountCode = useCallback(() => {
    const templateDiscount: any = parseSubmitDiscount(collection, discount, customers, customerProductsRecommend)
    wrapperSubmit(templateDiscount)

  }, [collection, customerProductsRecommend, customers, discount, wrapperSubmit])

  const handleSubmit = useCallback(async (codes: any) => {

    if(!codes) return

    const emailsToDeliver = parseTemplateEmailCustomers(customers, collection, discount, body, customerProductsRecommend, codes)

    try {
      onComplete(true)
      wrapperModal()

      await Promise.all(
        emailsToDeliver.map(async (email: any) => {
          return fetch(AWS_ENDPOINTS.deliverEmails(), {
            method: 'POST',
            body: JSON.stringify(email),
            mode: 'no-cors'
          })
        })
      )
    } catch (error) {
      console.log(error)
      onError(true)
    } finally {
      onComplete(false)
    }

  }, [body, collection, customers, discount])

  return (
    <>
      <Form onSubmit={handleSubmitDiscountCode}>
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