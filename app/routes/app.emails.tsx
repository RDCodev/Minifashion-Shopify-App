import {
  Layout,
  Page,
  BlockStack,
  Frame,
  Modal,
  Toast,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { QueriesContexts, SHOPIFY_APP_ID, grahpqlQueries } from "~/utils/app.shopify";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import type { CustomerList } from "~/interfaces/api.aws.interfaces";
import EmailsCustomers from "./emails.builder/components/emails.customers";
import EmailsProducts from "./emails.builder/components/emails.products";
import EmailsBuilder from "./emails.builder/components/emails.builder";
import { nanoid } from "nanoid";
import { flat } from "~/utils/app.utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const queryFilter = (query: any) => query.context === QueriesContexts.PRODUCTS
  const respQLResponse = await admin.graphql(grahpqlQueries.filter(queryFilter)[0].query(100))

  const { data: { products: { edges: savedProducts } } } = await respQLResponse.json()

  const api = AWS_ENDPOINTS.customersList(SHOPIFY_APP_ID)
  const response = await fetch(api)
  const { customers }: CustomerList = await response.json()

  return json({ customers: customers || [], savedProducts })
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request)

  const formData = await request.formData();

  const response = await admin.graphql(
    `
    #graphql
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                codes(first: 10) {
                  nodes {
                    code
                  }
                }
                startsAt
                endsAt
                customerSelection {
                  ... on DiscountCustomers {
                    customers {
                      id
                    }
                  }
                }
                customerGets {
                  value {
                    ... on DiscountPercentage {
                      percentage
                    }
                  }
                  items {
                    ... on DiscountProducts {
                      products(first: 10) {
                        nodes {
                          id
                        }
                      }
                    }
                  }
                }
                appliesOncePerCustomer
              }
            }
          }
          userErrors {
            field
            code
            message
          }
        }
      }
    `, {
    variables: {
      basicCodeDiscount: {
        title: `${formData.get("title")}`,
        code: `${nanoid(20)}`,
        startsAt: `${new Date(Number(formData.get("startsAt"))).toISOString()}`,
        endsAt: `${new Date(Number(formData.get("endsAt"))).toISOString()}`,
        customerSelection: {
          customers: {
            add: [`gid://shopify/Customer/${formData.get("customers")}`]
          }
        },
        customerGets: {
          value: {
            percentage: parseFloat(formData.get("percentage") as string)
          },
          items: {
            products: {
              productsToAdd: formData.get("products")?.toString().split(",").map(
                (id: any) => { return `gid://shopify/Product/${id}` }
              )
            }
          }
        },
        "appliesOncePerCustomer": true
      }
    }
  }
  )

  const responseJson = await response.json();
  const {code} = flat(responseJson, {})

  return {code}
}

export default function EmailsPage() {

  const { customers, savedProducts } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>();

  const [discount, setDiscount] = useState("")
  const [activate, setActivate] = useState(false)
  const [active, setActive] = useState(false)
  const [recommendProducts, setRecommendProducts] = useState<any[]>([])
  const [offerProducts, setOfferProducts] = useState([])
  const [customerEmails, setCustomerEmails] = useState([])

  const code = actionData?.code

  const submit = useSubmit()

  const wrapperSetRecommendProducts = useCallback((state: any) => {
    setRecommendProducts(state)
  }, [setRecommendProducts])

  const wrapperSetOfferProducts = useCallback((state: any) => {
    setOfferProducts(state)
  }, [setOfferProducts])

  const wrapperSetCustomerEmails = useCallback((state: any) => {
    setCustomerEmails(state)
  }, [setCustomerEmails])

  const wrapperSetActiveModal = useCallback((state: any) => {
    setActive(state)
  }, [setActive])

  const handleChange = useCallback(() => setActive(!active), [active])
  const toggleActive = useCallback(() => setActivate((active) => !active), []);

  const handleSubmit = useCallback((data: any) => submit(data, {
    method: 'POST',
  }), [submit])

  const toastMarkup = activate ? (
    <Toast content='Email Deliver' onDismiss={toggleActive} />
  ) : null;

  useEffect(() => {
    setDiscount(code)
  }, [code])

  return (
    <>
      <div style={{ height: '0px' }}>
        <Frame>
          <Modal
            open={active}
            onClose={handleChange}
            title='Template Email Information'
          >
            <Modal.Section>
              <EmailsBuilder
                emails={customerEmails}
                offerProducts={offerProducts}
                wrapperState={wrapperSetActiveModal}
                onSend={toggleActive}
                discountCode={discount}
                wrapperSubmit={handleSubmit}
              />
            </Modal.Section>
          </Modal>
        </Frame>
      </div>
      <Page
        backAction={{ content: 'Recommend', url: '/app/recommend' }}
        title="Email Deliver"
        primaryAction={{
          content: 'Send Emails',
          onAction: () => handleChange()
        }}
      >
        <Layout>
          <Layout.Section >
            <Layout>
              <Layout.Section variant="oneHalf">
                <BlockStack gap="200">
                  <EmailsProducts
                    recommendations={recommendProducts}
                    wrapperState={wrapperSetOfferProducts}
                  />
                </BlockStack>
              </Layout.Section>
            </Layout>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Layout>
              <Layout.Section variant="oneHalf">
                <BlockStack gap="400">
                  <EmailsCustomers
                    customers={customers}
                    products={savedProducts}
                    wrapperState={wrapperSetRecommendProducts}
                    wrapperStateEmails={wrapperSetCustomerEmails}
                  />
                </BlockStack>
              </Layout.Section>
            </Layout>
          </Layout.Section>
        </Layout>
      </Page>
      <Frame>
        {toastMarkup}
      </Frame>
    </>
  )
}
