import {
  Text,
  Card,
  Layout,
  Page,
  DropZone,
  BlockStack,
  TextField,
  Autocomplete,
  Icon,
  InlineStack,
  Checkbox,
  Tag,
  OptionList
} from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";
import { SearchMinor } from '@shopify/polaris-icons';
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { SHOPIFY_APP_ID } from "~/utils/app.shopify";
import type { Customer, CustomerList, CustomerProduct } from "~/interfaces/api.aws.interfaces";
import { useLoaderData } from "@remix-run/react";
import { capatilize } from "~/utils/app.utils";

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
            node{ 
              id
              title
              vendor
              productType
              tags
            }
          }
        }
      } 
    `
  }
]

const retrieveCommonObjectByFields = (source: any[], retrieveSize: number = 5, fields: any[]) => {
  const commonObjects = source.reduce((array, { node }: any) => {
    if(fields.includes(node.productType) || fields.includes(node.vendor))
      array.push({ label: capatilize(node.title), value: node.id.split('/').slice(-1, 1) })

    return array
  }, [])

  return commonObjects.sort( () => Math.random() - 0.5).slice(0, retrieveSize)
}

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

export default function EmailsPage() {

  const { customers, savedProducts } = useLoaderData<typeof loader>()

  const deselectedOptions = useMemo(
    () => customers.map((customer) => ({ label: customer.name, value: String(customer.customer_id) })),
    [customers]
  );

  const [recommendProducts, setRecommendProducts] = useState<any[]>([])
  const [emailBody, setEmailBody] = useState(``)
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(deselectedOptions);
  const [customer, setCustomer] = useState<any>({ name: '', email: '', marketing_state: false, common_products: [], favorite_vendors: [] })

  const handleChange = useCallback((newValue: string) => setEmailBody(newValue), [])

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === '') {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [deselectedOptions],
  );

  const updateSelection = useCallback(
    (selected: string[]) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      const customerProps = updateCustomer(selectedValue[0] || '', customers as Customer[])
      const { common_products, favorite_vendors } = customerProps

      setSelectedOptions(selected);
      setCustomer(customerProps)
      setRecommendProducts(retrieveCommonObjectByFields(savedProducts, 5, [...common_products, ...favorite_vendors]))
      setInputValue(selectedValue[0] || '');
    },
    [options, customers, savedProducts],
  );

  const updateCustomer = (customer_name: string, customers: Customer[]): any => {
    const customer = customers.filter((customer) => customer.name === customer_name)
    const { products, ...props } = customer[0]

    const common_products = [...new Set(products?.map((product: CustomerProduct) => {
      return product.type
    }))]

    const favorite_vendors = [...new Set(products?.map((product: CustomerProduct) => {
      return product.vendor
    }))]

    return { ...props, common_products, favorite_vendors }
  }

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Customers"
      value={inputValue}
      prefix={<Icon source={SearchMinor} tone="base" />}
      placeholder="Search"
      autoComplete="off"
    />
  );

  const commonProducts = customer.common_products.map((product: any) => (
    <Tag key={product}>{capatilize(product)}</Tag>
  ))

  const favoriteVendors = customer.favorite_vendors.map((vendor: any) => (
    <Tag key={vendor}>{capatilize(vendor)}</Tag>
  ))

  /*   const removeTag = useCallback(
      (tag: string) => () => {
        const options = [...selectedOptions];
        options.splice(options.indexOf(tag), 1);
        setSelectedOptions(options);
      },
      [selectedOptions],
    );
  
    const tagsMarkup = selectedOptions.map((option) => (
      <Tag key={`option-${option}`} onRemove={removeTag(option)}>
        {option}
      </Tag>
    ));
  
    const optionsMarkup =
      options.length > 0
        ? options.map((option) => {
          const { label, value } = option;
  
          return (
            <Listbox.Option
              key={`${value}`}
              value={value}
              selected={selectedOptions.includes(value)}
              accessibilityLabel={label}
            >
              {label}
            </Listbox.Option>
          );
        })
        : null; */

  return (
    <Page
      backAction={{ content: 'Recommend', url: '/app/recommend' }}
      title="Email Creator"
      primaryAction={{ content: 'Send Emails' }}
    >
      <Layout>
        <Layout.Section >
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingLg">
                    Email Template
                  </Text>
                  <TextField
                    label="Body Email"
                    value={emailBody}
                    onChange={handleChange}
                    multiline={8}
                    autoComplete="off"
                  />
                </BlockStack>

              </Card>
            </Layout.Section>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="500">
                  <Text as="h3" variant="headingLg">
                    Banner Image
                  </Text>
                  <DropZone accept="image/*" type="image">
                  </DropZone>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Layout>
            <Layout.Section variant="oneHalf">
              <BlockStack gap="400">
                <Autocomplete
                  options={options}
                  selected={selectedOptions}
                  onSelect={updateSelection}
                  textField={textField}
                />
                <Text as="span" variant="headingSm" fontWeight="bold">
                  Customer Information
                </Text>
                <Card>
                  <BlockStack gap="500">
                    <InlineStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Customer Name:
                      </Text>
                      <Text as="p" variant="bodyLg">
                        {customer.name}
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Customer Email:
                      </Text>
                      <Text as="p" variant="bodyLg">
                        {customer.email}
                      </Text>
                    </InlineStack>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Common Products
                      </Text>
                      <InlineStack gap="200">
                        {commonProducts}
                      </InlineStack>
                    </BlockStack>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Most Favorite Vendors
                      </Text>
                      <InlineStack gap="200">
                        {favoriteVendors}
                      </InlineStack>
                    </BlockStack>
                    <InlineStack gap="200">
                      <Checkbox
                        label="Email Marketing"
                        disabled={false}
                        checked={customer.marketing_state}
                        onChange={() => { }}
                      />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </BlockStack>
            </Layout.Section>
            <Layout.Section variant="oneHalf">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Products Recommendations.
                </Text>
                <Card>
                  <OptionList
                    onChange={setSelected}
                    options={recommendProducts}
                    selected={selected}
                    allowMultiple
                  />
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
