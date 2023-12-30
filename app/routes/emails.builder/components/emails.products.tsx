import {
  Text,
  Card,
  useIndexResourceState,
  IndexTable,
  EmptySearchResult
} from "@shopify/polaris";
import { useMemo } from "react";


export default function EmailsProducts({ recommendations, wrapperState }: any) {

  const resourceName = {
    singular: 'recommendation',
    plural: 'recommendations'
  }

  const { selectedResources, allResourcesSelected,
    handleSelectionChange } = useIndexResourceState(recommendations)

  useMemo(() => {

    const offerProducts = recommendations.reduce((arr: any, recommend: any) => {

      if(selectedResources.includes(recommend.id))
        arr = [...arr, recommend]

      return arr
    }, [])

    wrapperState(offerProducts)
  }, [selectedResources, wrapperState, recommendations])

  const rowMarkup = recommendations.map(
    ({ id, value, price }: any, index: number) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>{value}</IndexTable.Cell>
        <IndexTable.Cell>{price}</IndexTable.Cell>
      </IndexTable.Row>
    ))

  const emptyStateMarkup = (
    <EmptySearchResult
      title={'No recommendations found.'}
      description={'Try changing the filters or search term'}
      withIllustration
    />
  );

  return (
    <>
      <Text as="h3" variant="headingSm">
        Products Recommendations.
      </Text>
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={recommendations.length}
          selectedItemsCount={
            allResourcesSelected ? 'All' :
              selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: 'Product' },
            { title: 'Price' }
          ]}
          emptyState={emptyStateMarkup}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </>
  )
}