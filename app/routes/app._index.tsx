
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Banner } from "@shopify/polaris"
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  //const { admin } = await authenticate.admin(request);

  return null;
};

export default function Index() {

  return (
    <Page>
      <Banner onDismiss={() => { }}>
        <p>
          <b>We use your data only to generate recommendations for your clients.</b>
        </p>
      </Banner>
    </Page>
  );
}
