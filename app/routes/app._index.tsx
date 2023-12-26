
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Text,
  Card,
  Layout,
  Page,
  BlockStack,
} from "@shopify/polaris"
import { authenticate } from "../shopify.server";
import LinePlotEmailMetrics from "./app.metrics/app.metrics.chart";
import { AWS_ENDPOINTS } from "~/utils/api.aws";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const api = AWS_ENDPOINTS.emailsMetrics();
  const response = await fetch(api)
  const { emails_metrics } = await response.json();

  return json({ emails_metrics })
};

export default function Index() {

  const { emails_metrics } = useLoaderData<any>()

  const {
    total_open_emails,
    total_clicked_emails,
    total_deliver_emails,
    emails_metrics_dataset
  } = emails_metrics

  return (
    <Page
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="100">
              <Text as="h3">
                Deliver Emails
              </Text>
              <BlockStack inlineAlign="end">
                
              </BlockStack>
              <Text as="strong" variant="headingMd">
                {total_deliver_emails}
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
                
              </BlockStack>
              <Text as="strong" variant="headingMd">
                {total_open_emails}
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
                
              </BlockStack>
              <Text as="strong" variant="headingMd">
                {total_clicked_emails}
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
            <LinePlotEmailMetrics 
              dataset={emails_metrics_dataset}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
