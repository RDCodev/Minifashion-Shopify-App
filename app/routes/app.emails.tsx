import {
  Layout,
  Page,
  BlockStack,
  Frame,
  Modal,
  Toast,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { SHOPIFY_APP_ID } from "~/utils/app.shopify";
import { useLoaderData } from "@remix-run/react";
import type { CustomerList } from "~/interfaces/api.aws.interfaces";
import EmailsCustomers from "./emails.builder/components/emails.customers";
import EmailsProducts from "./emails.builder/components/emails.products";
import EmailsBuilder from "./emails.builder/components/emails.builder";

const enum QueriesContexts {
  PRODUCTS = 'products',
  CUSTOMERS = 'customers'
}

const grahpqlQueries = [
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const queryFilter = (query: any) => query.context === QueriesContexts.PRODUCTS
  const respQLResponse = await admin.graphql(grahpqlQueries.filter(queryFilter)[0].query(100))

  const { data: { products: { edges: savedProducts } } } = await respQLResponse.json()

  const api = AWS_ENDPOINTS.customersList(SHOPIFY_APP_ID)
  const response = await fetch(api)
  const { customers }: CustomerList = await response.json()

  return json({ customers, savedProducts })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  console.log(formData)
  return null
}

export default function EmailsPage() {

  const { customers, savedProducts } = useLoaderData<typeof loader>()

  const [activate, setActivate] = useState(false)
  const [active, setActive] = useState(false)
  const [recommendProducts, setRecommendProducts] = useState<any[]>([])
  const [offerProducts, setOfferProducts] = useState([])
  const [customerEmails, setCustomerEmails] = useState([])

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
  },[setActive])

  const handleChange = useCallback(() => setActive(!active), [active])
  const toggleActive = useCallback(() => setActivate((active) => !active), []);

  const toastMarkup = activate ? (
    <Toast content='Email Deliver' onDismiss={toggleActive} />
  ) : null;

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
                emails= {customerEmails}
                offerProducts={offerProducts}
                wrapperState={wrapperSetActiveModal}
                onSend={toggleActive}
              />
            </Modal.Section>
          </Modal>
        </Frame>
      </div>
      <Page
        backAction={{ content: 'Recommend', url: '/app/recommend' }}
        title="Email Creator"
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
