
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Text,
  Card,
  Layout,
  Page
} from "@shopify/polaris"
import { authenticate } from "../shopify.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null
};

export const action = async ({ request }: ActionFunctionArgs) => {
  //const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {

  return(
    <Page
    title="Insights Emails"
    subtitle="Metrics about the recommendations sent to your customers"
  >
    <Layout>
      <Layout.Section variant="oneThird">
        <Card>
          <Text as="h2">
            Lorem Ipsum
          </Text>
          <p>Lorem</p>
        </Card>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <Card>
          <Text as="h2">
            Lorem Ipsum
          </Text>
          <p>Lorem</p>
        </Card>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <Card>
          <Text as="h2">
            Lorem Ipsum
          </Text>
          <p>Lorem</p>
        </Card>
      </Layout.Section>

    </Layout>
  </Page>
  )
}
