import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { IndexTableProps } from "@shopify/polaris";
import {
  Badge,
  Button,
  EmptySearchResult,
  IndexTable,
  InlineStack,
  LegacyCard,
  Page,
  useBreakpoints,
  useIndexResourceState
} from "@shopify/polaris";
import type { CustomerList } from "~/interfaces/api.aws.interfaces";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { SHOPIFY_APP_ID } from "~/utils/app.shopify";
import { capatilize } from "~/utils/app.utils";
import RecommendProducts from "./app.recommend/components/recommend.products";
//import { retrieveCommonObjectByFields } from "./emails.builder/functions/emails.functions";

function parseCustomerList(customers: any[]) {
  return customers.reduce((arr, { products, customer_id, name, ...props }: any) => {

    const common_products = [... new Set(products?.map((product: any) => {
      return capatilize(product.type)
    }))]

    const favorite_vendors = [...new Set(products?.map((product: any) => {
      return capatilize(product.vendor)
    }))]

    //const recommendations: any = retrieveCommonObjectByFields(products, 3, [...common_products, ...favorite_vendors])

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

  const api = AWS_ENDPOINTS.customersList(SHOPIFY_APP_ID);
  const response = await fetch(api);
  const { customers }: CustomerList = await response.json();

  return json({ customers: parseCustomerList(customers) });
};

export default function RecommendPage() {

  //const navigate = useNavigate();

  const { customers } = useLoaderData<typeof loader>() || []

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
                <Badge key={vendor}>{vendor}</Badge>
              ))
            }
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="050">
            {
              common_products.map((common: any) => (
                <Badge key={common}>{common}</Badge>
              ))
            }
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  )

  return (
    <>
      <RecommendProducts/>
      <Page
        fullWidth
        title="Customers Recommendations"
        subtitle="Recommend products to your customers"
        primaryAction={
          <Button variant="primary">Recommend</Button>
        }
      >
        <LegacyCard>
          <IndexTable
            condensed={useBreakpoints().smDown}
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
      </Page>
    </>
  );
}
