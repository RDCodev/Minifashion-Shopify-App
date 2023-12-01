
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { 
  IndexTableProps} from "@shopify/polaris";

import { 
  Card, 
  EmptySearchResult, 
  IndexTable, 
  Page, 
  Text } from "@shopify/polaris"
import { authenticate } from "../shopify.server";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SHOPIFY_APP_ID } from "~/utils/app.shopify";
import type { CustomerList } from "~/interfaces/api.aws.interfaces";
import { Fragment } from "react";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const api = AWS_ENDPOINTS.customersList(SHOPIFY_APP_ID);
  const response = await fetch(api);
  const { customers }: CustomerList = await response.json();

  return json({ customers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  //const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {

  const { customers } = useLoaderData<typeof loader>()

  const rows = customers || []

  const columnHeadings = [
    { title: 'Name', id: 'name' },
    {
      id: 'product-title',
      title: 'Product',
    },
    {
      id: 'order-count',
      title: 'Vendor',
    },
    {
      id: 'product-type',
      title: 'Type'
    },
    {
      id: 'product-tags',
      title: 'Tags'
    },
  ];

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

  const rowMarkup = rows
  .filter(customer => customer.products)
  .map(({name, products}: any, index) => {
    return (
      <Fragment key={index}>
        <IndexTable.Row
          rowType="subheader"
          id={String(index)}
          position={index}
          disabled={true}
        >
          <IndexTable.Cell
            colSpan={5}
            scope="colgroup"
            as="th"
            id={String(index)}
          >
            {`${name}`}
          </IndexTable.Cell>
        </IndexTable.Row>
        {products.map(
          (
            { product_id, vendor, title, type, tags }: any,
            rowIndex: number,
          ) => {
            
            return (
              <IndexTable.Row
                key={rowIndex}
                id={String(product_id)}
                position={rowIndex}>
                <IndexTable.Cell>
                  <Text variant="bodyMd" fontWeight="semibold" as="span">
                    -
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span">
                    {type}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  {vendor}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span">
                    {tags}
                  </Text>
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          },
        )}
      </Fragment>
    );
  });

  return (
    <>
      <Page
        fullWidth
        title="Dashboard"
        subtitle="Recommend products to your customers"
        primaryAction={{ content: 'Recommend' }}
      >
        <Card>
          <Text as="h2" variant="bodyMd">
            <IndexTable
              selectable={false}
              resourceName={resourceName}
              itemCount={customers.length}
              emptyState={emptyStateMarkup}
              headings={columnHeadings as IndexTableProps['headings']}
  
            >
              {rowMarkup}
            </IndexTable>
          </Text>
        </Card>
      </Page>
    </>
  );
}
