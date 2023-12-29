import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "~/shopify.server";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function RecommendProducts({ customers, onClick }: any) {

  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <>
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <ui-modal id="my-modal">
          <p>Message</p>
          <ui-title-bar title="Title">
            <button variant="primary">Label</button>
            <button onclick="document.getElementById('my-modal').hide()">Label</button>
          </ui-title-bar>
        </ui-modal>
        <button onclick="document.getElementById('my-modal').show()">Open Modal</button>
      </AppProvider>
    </>
  )
}