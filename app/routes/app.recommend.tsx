import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { IndexTableProps } from "@shopify/polaris";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  EmptySearchResult,
  Frame,
  IndexTable,
  InlineStack,
  LegacyCard,
  Modal,
  Page,
  Toast,
  useIndexResourceState
} from "@shopify/polaris";
import type { CustomerList } from "~/interfaces/api.aws.interfaces";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { grahpqlQueries, QueriesContexts, SHOPIFY_APP_ID } from "~/utils/app.shopify";
import { capatilize } from "~/utils/app.utils";
import RecommendProducts from "./app.recommend/components/recommend.products";
import { useCallback, useEffect, useRef, useState } from "react";
import { authenticate } from "~/shopify.server";

function parseCustomerList(customers: any[]) {
  return customers.reduce((arr, { products, customer_id, name, ...props }: any) => {

    const common_products = [... new Set(products?.map((product: any) => {
      return product.type
    }))]

    const favorite_vendors = [...new Set(products?.map((product: any) => {
      return product.vendor
    }))]

    return [...arr, {
      id: customer_id,
      customer: name,
      ...props,
      common_products,
      favorite_vendors
    }]
  }, [])
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const queryFilter = (query: any) => query.context === QueriesContexts.PRODUCTS
  const respQLResponse = await admin.graphql(grahpqlQueries.filter(queryFilter)[0].query(100))

  const { data: { products: { edges: savedProducts } } } = await respQLResponse.json()

  const api = AWS_ENDPOINTS.customersList(SHOPIFY_APP_ID);
  const response = await fetch(api);
  const { customers }: CustomerList = await response.json();

  return json({ customers: parseCustomerList(customers), savedProducts });
};

export default function RecommendPage() {

  const { customers, savedProducts } = useLoaderData<typeof loader>() || []

  const [activate, setActivate] = useState(false)
  const [deliver, setDeliver] = useState(false)
  const [deliverError, setDeliverError] = useState(false)
  const [recommendCustomers, setRecommendCustomers] = useState<any[]>([])

  const buttonRef: any = useRef()
  const columnHeadings = [
    { title: 'Customer' },
    { title: 'Email' },
    { title: 'Email subscription' },
    { title: 'Favorite Vendor' },
    { title: 'Common Products' },
  ];

  const { selectedResources,
    allResourcesSelected,
    handleSelectionChange } = useIndexResourceState(customers)

  const emptyStateMarkup = (
    <EmptySearchResult
      title={'No customers yet'}
      description={'Try changing the filters or search term'}
      withIllustration
    />
  );

  const resourceName = {
    singular: 'customer',
    plural: 'customers',
  };

  const toggleModal = useCallback(() => {
    setActivate(!activate)
  }, [activate])

  const toggleDeliver = useCallback((state: boolean) => {
    setDeliver(state)
  }, [])

  const toggleDeliverError = useCallback((state: boolean) => {
    setDeliverError(state)
  }, [])

  const updateCustomers = useCallback((selections: any[]) => {
    const customersRecommendations = selections.reduce((arr: any[], selection: any) => {

      const [customerFilter] = customers.filter((customer: any) => customer.id == selection)

      return [...arr, customerFilter]
    }, [])

    setRecommendCustomers([...customersRecommendations])
  }, [customers])

  useEffect(() => {
    updateCustomers(selectedResources)
  }, [selectedResources, updateCustomers])

  const rowMarkup = customers.map(
    ({
      id,
      customer,
      email,
      marketing_state,
      favorite_vendors,
      common_products
    }: any, index: number) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          {customer}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {email}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={
            marketing_state ? 'success' : 'info'
          }>
            {marketing_state ? 'Subscribe' : 'Not Subscribe'}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="050">
            {
              favorite_vendors.map((vendor: any) => (
                <Badge key={vendor}>{capatilize(vendor)}</Badge>
              ))
            }
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="050">
            {
              common_products.map((common: any) => (
                <Badge key={common}>{capatilize(common)}</Badge>
              ))
            }
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  )

  const modalRecommendation = () => (
    <div style={{
      height: "0px"
    }}>
      <Frame>
        <Modal
          activator={buttonRef}
          open={activate}
          onClose={toggleModal}
          title="Recommendations"
        >
          <Modal.Section>
            <RecommendProducts
              customers={recommendCustomers}
              products={savedProducts}
              onComplete={toggleDeliver}
              onError={toggleDeliverError}
              wrapperModal={toggleModal}
            />
          </Modal.Section>
        </Modal>
      </Frame>
    </div>
  )

  const toastDelivering = () => (
    <div style={{ height: '0px' }}>
      <Frame>
        {
          deliver ? (
            <Toast content="Delivering ..." onDismiss={() => {setDeliver(false)}} duration={3000}/>
          ) : null          
        }
        {
          deliverError ? (
            <Toast content="Deliver Error" error onDismiss={() => {setDeliverError(false)}} duration={3000}/>
          ) : null
        }
      </Frame>
    </div>
  )

  return (
    <>
      {modalRecommendation()}
      <Page
        fullWidth
        title="Customers Recommendations"
        subtitle="Recommend products to your customers"
        primaryAction={
          <div ref={buttonRef}>
            <Button variant="primary" onClick={toggleModal}>Recommend</Button>
          </div>
        }
      >
        <BlockStack gap="200">
          <Banner
            title="Becarefull while delivering recommendation are in progress."
            tone="warning"
          >
            <p>Please don't change to another tab or page while delivering recommendation to yours customers.</p>
          </Banner>

          <LegacyCard>
            <IndexTable

              resourceName={resourceName}
              itemCount={customers.length}
              selectedItemsCount={
                allResourcesSelected ? 'All' : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              emptyState={emptyStateMarkup}
              headings={columnHeadings as IndexTableProps['headings']}
            >
              {rowMarkup}
            </IndexTable>
          </LegacyCard>
        </BlockStack>
      </Page>
      {toastDelivering()}
    </>
  );
}
