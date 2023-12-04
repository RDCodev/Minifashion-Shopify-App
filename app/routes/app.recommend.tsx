import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { IndexTableProps } from "@shopify/polaris";
import { Card, EmptySearchResult, Frame, IndexTable, Modal, Page, Text, TextContainer } from "@shopify/polaris";
import { Fragment, useCallback, useState } from "react";
import type { CustomerList } from "~/interfaces/api.aws.interfaces";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { SHOPIFY_APP_ID } from "~/utils/app.shopify";
import { capatilize } from "~/utils/app.utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {

  const api = AWS_ENDPOINTS.customersList(SHOPIFY_APP_ID);
  const response = await fetch(api);
  const { customers }: CustomerList = await response.json();

  return json({ customers });
};


export default function RecommendPage() {

  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]);

  const { customers } = useLoaderData<typeof loader>()
  const rows = customers || []

  const columnHeadings = [
    { title: 'Name' },
    { title: 'Product' },
    { title: 'Vendor' },
    { title: 'Type' },
    { title: 'Tags' },
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

  const modalRecommend = () => {
    return (
      <div style={{ height: '0px' }}>
        <Frame>
          <Modal
            open={active}
            onClose={handleChange}
            title="Products Recommendatons by Costumer"
            primaryAction={{
              content: 'Add Instagram',
              onAction: handleChange,
            }}
            secondaryActions={[
              {
                content: 'Learn more',
                onAction: handleChange,
              },
            ]}
          >
            <Modal.Section>
              <TextContainer>
                <p>
                  Use Instagram posts to share your products with millions of
                  people. Let shoppers buy from your store without leaving
                  Instagram.
                </p>
              </TextContainer>
            </Modal.Section>
          </Modal>
        </Frame>
      </div>
    )
  }

  const rowMarkup = rows
    .filter(customer => customer.products)
    .map(({ name, products }: any, index) => {
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
                  </IndexTable.Cell>
                  <IndexTable.Cell>{capatilize(title)}</IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span">
                      {capatilize(type)}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {capatilize(vendor)}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span">
                      {capatilize(tags)}
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
      {modalRecommend()}
      <Page
        fullWidth
        title="Dashboard"
        subtitle="Recommend products to your customers"
        actionGroups={[
          {
            title: 'Recommend',
            actions: [
              {
                content: 'Products',
                onAction: handleChange,
              }, {
                content: 'Promotions',
                onAction: () => navigate('/app/emails'),
              }
            ],
          }
        ]}
      >
        <Card>
          <IndexTable
            selectable={false}
            resourceName={resourceName}
            itemCount={customers.length}
            emptyState={emptyStateMarkup}
            headings={columnHeadings as IndexTableProps['headings']}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
      </Page>
    </>
  );
}
