import {
  Text,
  Autocomplete,
  BlockStack,
  Card,
  Checkbox,
  InlineStack,
  Tag,
  Icon
} from "@shopify/polaris";
import { SearchMinor } from '@shopify/polaris-icons';
import { useCallback, useMemo, useState } from "react";
import type { Customer, CustomerProduct } from "~/interfaces/api.aws.interfaces";
import { capatilize } from "~/utils/app.utils";
import { retrieveCommonObjectByFields } from "../functions/emails.functions";

export default function EmailsCustomers({ customers, products, wrapperState, wrapperStateEmails }: any) {

  const [customer, setCustomer] = useState<any>({ name: '', email: '', marketing_state: false, common_products: [], favorite_vendors: [] })
  const deselectedOptions = useMemo(
    () => customers.map((customer: any) => ({ label: customer.name, value: String(customer.customer_id) })),
    [customers]
  );

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(deselectedOptions);

  const updateCustomer = useCallback((customer_name: string, customers: Customer[]): any => {
    const customer = customers.filter((customer) => customer.name === customer_name)
    const { products, ...props } = customer[0]

    const common_products = [...new Set(products?.map((product: CustomerProduct) => {
      return product.type
    }))]

    const favorite_vendors = [...new Set(products?.map((product: CustomerProduct) => {
      return product.vendor
    }))]

    const customerDeliverEmail = {
      name: props.name,
      email: props.email,
      isMarketing: props.marketing_state
    }

    wrapperStateEmails(customerDeliverEmail)

    return { ...props, common_products, favorite_vendors }
  }, [wrapperStateEmails])

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === '') {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const resultOptions = deselectedOptions.filter((option: any) =>
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [deselectedOptions],
  );

  const updateSelection = useCallback(
    (selected: string[]) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option: any) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      const customerProps = updateCustomer(selectedValue[0] || '', customers as Customer[])
      const { common_products, favorite_vendors } = customerProps

      setSelectedOptions(selected);
      setCustomer(customerProps)
      wrapperState(retrieveCommonObjectByFields(products, 10, [...common_products, ...favorite_vendors]))
      setInputValue(selectedValue[0] || '');
    },
    [options, customers, products, wrapperState, updateCustomer],
  );

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

  /* const emptyCustomerState = () => (
    <EmptyState
      heading="Manage your inventory transfers"
      action={{ content: 'Add transfer' }}
      secondaryAction={{
        content: 'Learn more',
        url: 'https://help.shopify.com',
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Track and receive your incoming inventory from suppliers.</p>
    </EmptyState>
  ) */

  return (
    <>
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
    </>
  )
}
