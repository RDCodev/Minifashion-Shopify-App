
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Text,
  Card,
  Layout,
  Page,
  BlockStack,
} from "@shopify/polaris"
import { authenticate } from "../shopify.server";
import LinePlotEmailMetrics from "./app.metrics/app.metrics.chart";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null
};

export default function Index() {

  return (
    <Page
      title="Insights Emails"
      subtitle="Metrics about the recommendations sent to your customers"
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="100">
              <Text as="h3">
                Deliver Emails
              </Text>
              <BlockStack inlineAlign="end">
              <img src="https://cdn.shopify.com/s/files/1/0669/2811/5967/files/email.png?v=1703179240" width="70px" alt="" />
              </BlockStack>
              <Text as="strong" variant="headingMd">
                17
              </Text>
              <Text as="span">
                Emails deliver rate
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="100">
              <Text as="h3">
                Open Emails
              </Text>
              <BlockStack inlineAlign="end">
              <img src="https://cdn.shopify.com/s/files/1/0669/2811/5967/files/open-email.png?v=1703179239" width="70px" alt="" />
              </BlockStack>
              <Text as="strong" variant="headingMd">
                17
              </Text>
              <Text as="span">
                Emails open rate
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="100">
              <Text as="h3">
                Clicked Emails
              </Text>
              <BlockStack inlineAlign="end">
                <img src="https://cdn.shopify.com/s/files/1/0669/2811/5967/files/mail.png?v=1703179239" width="70px" alt="" />
              </BlockStack>
              <Text as="strong" variant="headingMd">
                17
              </Text>
              <Text as="span">
                Emails clicked rate
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="fullWidth">
          <Text as="h2">
            Metrics
          </Text>
          <Card>
            <LinePlotEmailMetrics/>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
